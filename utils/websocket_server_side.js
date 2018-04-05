// ==================================
// Websocket Server Side Code
// ==================================
//var async = require('async');
var path = require('path');

module.exports = function (g_options, fcw, logger) {
	var helper = require(path.join(__dirname, './helper.js'))(process.env.creds_filename, logger);
	var ws_server = {};
	var broadcast = null;
	var known_everything = {};
	var marbles_lib = null;
	var known_height = 0;
	var stopPeriodicChannelCheck = true;
	var checkPeriodically = null;
	var enrollInterval = null;

	//--------------------------------------------------------
	// Setup WS Module
	//--------------------------------------------------------
	ws_server.setup = function (l_broadcast, l_marbles_lib) {
		broadcast = l_broadcast;
		marbles_lib = l_marbles_lib;
		console.log("Marbles LIB : " + marbles_lib);

		// --- Keep Alive  --- //
		clearInterval(enrollInterval);
		enrollInterval = setInterval(function () {					//to avoid REQUEST_TIMEOUT errors we periodically re-enroll
			let enroll_options = helper.makeEnrollmentOptions(0);
			fcw.enroll(enroll_options, function (err, enrollObj2) {
				if (err == null) {
					//marbles_lib = require(path.join(__dirname, './marbles_cc_lib.js'))(enrollObj2, opts, fcw, logger);
				}
			});														//this seems to be safe 3/27/2017
		}, helper.getKeepAliveMs());								//timeout happens at 5 minutes, so this interval should be faster than that
	};

	// process web socket messages
	ws_server.process_msg = function (ws, data) {
		const channel = helper.getChannelId();
		const first_peer = helper.getFirstPeerName(channel);
		var options = {
			peer_urls: [helper.getPeersUrl(first_peer)],
			ws: ws,
			endorsed_hook: endorse_hook,
			ordered_hook: orderer_hook
		};

		// create a new marble
		if (data.type === 'createLC') {
			logger.info('[ws] create marbles req');
			options.args = {
				lcJSONStr : JSON.stringify(data.lc)
			};

			marbles_lib.createLC(options, function (err, txId) {
				if (err != null) {
                    console.error('Error in createLC. No response will be sent. error:', err);
                }
                else {
                    console.log('LC created.  No response will be sent. result:', JSON.stringify(txId));
                    sendMsg({type:'createLC', 'result' : 'success', 'txId' : txId});
                }
			});
		}

		// transfer a marble
		else if (data.type === 'updateStatus') {
			logger.info('[ws] transferring req');
			console.log(data.req);
			options.args = {
				shipment_id: data.req.shipmentId,
				status_str: data.req.status,
				status_val: data.req.value
			};

			marbles_lib.updateStatus(options, function (err, txId) {
				if (err != null) {
                    console.error('Error in updateStatus. No response will be sent. error:', err);
                }
                else {
                    console.log('updateStatus success.' + txId);
                    sendMsg({type:'updateStatus', 'result' : 'success', 'statusFlag' : data.req.value,
                    	'state' : data.req.status, 'txId' : txId});
                }
			});
		}

		else if (data.type === 'check_for_updates') {
			logger.info('[ws] check_for_updates req');
			stopPeriodicChannelCheck = false;
			ws_server.check_for_updates(ws);
			sendMsg({type:'known_height', 'result' : known_height});
		}

		else if (data.type === 'stop_check_for_updates') {
			logger.info('[ws] stop_check_for_updates req');
			stopPeriodicChannelCheck = true;
		}

		// send transaction error msg
		function send_err(msg, input) {
			sendMsg({ msg: 'tx_error', e: msg, input: input });
			sendMsg({ msg: 'tx_step', state: 'committing_failed' });
		}

		// send a message, socket might be closed...
		function sendMsg(json) {
			if (ws) {
				try {
					ws.send(JSON.stringify(json));
				}
				catch (e) {
					logger.debug('[ws error] could not send msg', e);
				}
			}
		}

		// endorsement stage callback
		function endorse_hook(err) {
			if (err) console.log('tx_step : endorsing_failed');
			else console.log('tx_step : ordering');
		}

		// ordering stage callback
		function orderer_hook(err) {
			if (err) console.log('tx_step : ordering_failed');
			else console.log('tx_step : committing');
		}
	};

	//------------------------------------------------------------------------------------------

	// sch next periodic check
	function sch_next_check() {
		clearTimeout(checkPeriodically);
		if (!stopPeriodicChannelCheck) {
			checkPeriodically = setTimeout(function () {
				try {
					ws_server.check_for_updates(null);
				}
				catch (e) {
					console.log('');
					logger.error('Error in sch next check\n\n', e);
					sch_next_check();
					ws_server.check_for_updates(null);
				}
			}, g_options.block_delay + 2000);
		}
	}

	// --------------------------------------------------------
	// Check for Updates to Ledger
	// --------------------------------------------------------
	ws_server.check_for_updates = function (ws_client) {
		marbles_lib.channel_stats(null, function (err, resp) {
			var newBlock = false;
			if (err != null) {
				var eObj = {
					msg: 'error',
					e: err,
				};
				if (ws_client) ws_client.send(JSON.stringify(eObj)); 								//send to a client
				else broadcast(eObj);																//send to all clients
			} else {
				if (resp && resp.height && resp.height.low) {
					if (resp.height.low > known_height || ws_client) {
						if (!ws_client) {
							console.log('');
							logger.info('New block detected!', resp.height.low, resp);
							var firstBroadcast = false;
							if (known_height == 0) {
								firstBroadcast = true;
							}
							known_height = resp.height.low;
							newBlock = true;
							logger.debug('[checking] there are new things, sending to all clients');
							if (firstBroadcast) {
								broadcast({ type: 'block', msg :  {block_height: resp.height.low}, first_broadcast : true });	//send to all clients
							} else {
								broadcast({ type: 'block', msg :  {block_height: resp.height.low} });	//send to all clients
							}
						} else {
							logger.debug('[checking] on demand req, sending to a client');
							var obj = {
								msg: 'block',
								e: null,
								block_height: resp.height.low,
								block_delay: g_options.block_delay
							};
							ws_client.send(JSON.stringify(obj)); 									//send to a client
						}
					}
				}
			}
			sch_next_check();
		});
	};

	return ws_server;
};
