'use strict';
/* global process */
/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved.
 *
 *******************************************************************************/
var express = require('express');
var router = express.Router();
var helper = require(__dirname + '/../utils/helper.js')(process.env.creds_filename, console);
var fs = require('fs');
var jqupload = require('jquery-file-upload-middleware');
const nodemailer = require('nodemailer');
// Load our modules.
var enrollObj;
var marbles_lib;

//anything in here gets passed to Pug template engine
function build_bag(req) {
	return {
		e: process.error,							//send any setup errors
		creds_filename: process.env.creds_filename,
		jshash: process.env.cachebust_js,			//js cache busting hash (not important)
		csshash: process.env.cachebust_css,			//css cache busting hash (not important)
		marble_company: process.env.marble_company,
		creds: get_credential_data()
	};
}

//get cred data
function get_credential_data() {
	const channel = helper.getChannelId();
	const first_org = helper.getClientOrg();
	const first_ca = helper.getFirstCaName(first_org);
	const first_peer = helper.getFirstPeerName(channel);
	const first_orderer = helper.getFirstOrdererName(channel);
	var ret = {
		admin_id: helper.getEnrollObj(first_ca, 0).enrollId,
		admin_secret: helper.getEnrollObj(first_ca, 0).enrollSecret,
		orderer: helper.getOrderersUrl(first_orderer),
		ca: helper.getCasUrl(first_ca),
		peer: helper.getPeersUrl(first_peer),
		chaincode_id: helper.getChaincodeId(),
		channel: helper.getChannelId(),
		chaincode_version: helper.getChaincodeVersion(),
		marble_owners: helper.getMarbleUsernames(),
	};
	for (var i in ret) {
		if (ret[i] == null) ret[i] = '';			//set to blank if not found
	}
	return ret;
}

//endorsement stage callback
function endorse_hook(err) {
	if (err) console.log('endorsing_failed');
	else console.log('ordering');
}

//ordering stage callback
function orderer_hook(err) {
	if (err) console.log('ordering_failed');
	else console.log('committing');
}

function getOptions() {
	console.log("Inside getOptions");
	const channel = helper.getChannelId();
	console.log("obtained channel:" + channel);
	const first_peer = helper.getFirstPeerName(channel);
	console.log("first peer:" + first_peer);
	var options = {
		peer_urls: [helper.getPeersUrl(first_peer)],
		endorsed_hook: endorse_hook,
		ordered_hook: orderer_hook
	};
	console.log("returning options :" + options);
	return options;
}

router.get('/', isAuthenticated, function (req, res) {
	console.log("User already authenticated");
});






router.post('/AddOrderDetails', function (req, res, next) {


	var options = getOptions();
	options.args = {
		lcJSONStr: JSON.stringify(req.body)
	};
	console.log("======================EBS======================");
	console.log(JSON.stringify(req.body));
	marbles_lib.createLC(options, function (err, txId) {
		if (err != null) {
			console.error('Error in createLC. No response will be sent. error:', err);
			var res = { 'result': 'failure', 'txId': '' };
		}
		else {
			console.log('LC created.  No response will be sent. result:', JSON.stringify(txId));
			var res = { 'result': 'success', 'txId': txId };
			//	sendMsg({type:'createLC', 'result' : 'success', 'txId' : txId});
		}

	});

	res.json("success");

});


function SendMail(mailOptions) {

	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	nodemailer.createTestAccount((err, account) => {
		// create reusable transporter object using the default SMTP transport
		let transporter = nodemailer.createTransport({
			host: '10.1.32.193',
			port: 25,
			secure: false
		});



		// send mail with defined transport object
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return console.log(error);
			}
			console.log('Message sent: %s', info.messageId);
			// Preview only available when sending through an Ethereal account
			console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

		});
	});
}

router.post('/api/UpdatePO', function (req, res, next) {


	var options = getOptions();
	options.args = {
		lcJSONStr: JSON.stringify(req.body)
	};
	console.log(JSON.stringify(req.body));
	marbles_lib.updatePO(options, function (err, txId) {
		if (err != null) {
			console.error('Error in createLC. No response will be sent. error:', err);
			var res = { 'result': 'failure', 'txId': '' };
		}
		else {
			console.log('LC created.  No response will be sent. result:', JSON.stringify(txId));
			var res = { 'result': 'success', 'txId': txId };
			//	sendMsg({type:'createLC', 'result' : 'success', 'txId' : txId});
		}

	});

	res.json("success");

});


router.get('/:page', function (req, res) {
	if (req.params.page == 'login') {
		res.render('login', { layout: null });
	} else if (req.params.page == 'getDocument') {
		console.log('Begin getDocument:');
		getDocument(req, res);
	} else if (req.params.page == 'logout') {
		req.session.destroy();
		res.redirect('/login');
	} else if (req.params.page == 'lcList') {
		retrieveLCApplications(req, res);
	} else if (req.params.page == 'buyer' || req.params.page == 'supplier'
		|| req.params.page == 'exporter' || req.params.page == 'customs') {
		if (req.query.shipmentId != null) {
			req.session.shipmentId = req.query.shipmentId;
			var options = getOptions();

			options.args = {
				shipment_id: req.session.shipmentId,
			};
			marbles_lib.fetchLC(options, function (err, lc) {
				if (err) {
					console.error('FetchLC failed:', err);
					res.redirect('/lcList');
				} else {
					var lcJSON = lc.parsed;
					console.log(lcJSON);
					var documentNames = lcJSON.documentNames;
					var lcFileName, blFileName, insFileName;
					if (documentNames != null) {
						console.log("Document names: " + documentNames);
						for (var i = 0; i < documentNames.length; i++) {
							if (i == 0) {
								lcFileName = documentNames[0];
							} else if (i == 1) {
								blFileName = documentNames[1];
							} else if (i == 2) {
								insFileName = documentNames[2];
							}
						}
					}

					console.log("LC FileName : " + lcFileName);
					console.log("BL FileName : " + blFileName);
					console.log("INS FileName : " + insFileName);
					var ebState1 = (lcJSON.exporterBankApproved) ? 'inline' : 'none';
					var ebState2 = (!lcJSON.exporterBankApproved) ? 'inline' : 'none';
					var eDocState1 = (lcJSON.exporterDocsUploaded) ? 'inline' : 'none';
					var eDocState2 = (!lcJSON.exporterDocsUploaded) ? 'inline' : 'none';
					var cusState1 = (lcJSON.customsApproved) ? 'inline' : 'none';
					var cusState2 = (!lcJSON.customsApproved) ? 'inline' : 'none';
					var payState1 = (lcJSON.paymentComplete) ? 'inline' : 'none';
					var payState2 = (!lcJSON.paymentComplete) ? 'inline' : 'none';
					var state = {
						'ebState1': ebState1, 'ebState2': ebState2, 'eDocState1': eDocState1, 'eDocState2': eDocState2,
						'cusState1': cusState1, 'cusState2': cusState2, 'payState1': payState1, 'payState2': payState2
					};
					var responsePage = req.params.page;
					var showCreate = (responsePage == 'buyer') ? 'inline-block' : 'none';
					if (responsePage == 'importerBank') {
						if (lcJSON.customsApproved) {
							responsePage = 'importerBankPayment';
						}
					}
					var showCreate =
						res.render(responsePage, {
							'lc': lcJSON, disabled: 'disabled',
							'lcFileName': lcFileName, 'blFileName': blFileName, 'insFileName': insFileName,
							role: req.session.role, date: formatDate(new Date()), st: state, createVisible: showCreate
						});
				}
			})
		} else {
			res.render(req.params.page, { role: req.session.role, date: formatDate(new Date()) });
		}
	}
	else {
		res.render(req.params.page, { role: req.session.role, date: formatDate(new Date()) });
	}
});

function formatDate(date) {
	var monthNames = [
		"January", "February", "March",
		"April", "May", "June", "July",
		"August", "September", "October",
		"November", "December"
	];

	var daysOfWeek = [
		"Sunday", "Monday", "Tuesday", "Wednesday",
		"Thursday", "Friday", "Saturday"
	];

	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();
	var week = date.getDay();
	console.log("Getting Date week : " + week);

	return daysOfWeek[week] + ', ' + day + ' ' + monthNames[monthIndex] + ' ' + year;
}

//Utility functions
function base64_encode(file) {
	// read binary data
	var bitmap = fs.readFileSync(file);
	// convert binary data to base64 encoded string
	return new Buffer(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str) {
	// create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
	var bitmap = new Buffer(base64str, 'base64');
	return bitmap;
}

// router.post('/processLogin', function (req, res) {
//     login(req, res);
// });

// router.get('/api/login', function (req, res) {
// 	return res.json({ "test": "dd" });
// 	//  login(req, res);
// });

router.post('/api/login', function (req, res) {
	//console.log("ddd");
	login(req, res);
});

router.post('/api/ricoh-homepage', function (req, res) {
	//console.log("ddd");

});

router.post('/addBidTest', function (req, res) {
	console.log("req.body");
	console.log(req.body);
	console.log(JSON.stringify(req.body));

	var options = getOptions();
	options.args = {
		assetJSONStr: JSON.stringify(req.body)
	};

	marbles_lib.addAPIPO(options, function (err, txId) {
		if (err != null) {
			console.error('Error in addAPIPO. No response will be sent. error:', err);
			var res = { 'result': 'failure', 'txId': '' };
		}
		else {
			console.log(' addAPIPO.  No response will be sent. result:', JSON.stringify(txId));
			var res = { 'result': 'success', 'txId': txId };


			// setup email data with unicode symbols
			let mailOptions = {
				from: 'noReply@hexaware.com', // sender address 
				to: 'vyjayanthis@hexaware.com', // list of receivers
				subject: 'To initiate Offer proposals', // Subject line
				//text: 'Hello Sir / Madam, We have rejection from banks based on the credit rating of our potential customer. Please review the sales orders and initiate offer for auction to customer contact. This is automated e-mail hence please do not reply back',
				// plain text body
				html: '<b>Hello Sir/Madam,</b> </br> <p>We have rejection from banks based on the credit rating of our potential customer. Please review the sales orders and initiate offer for auction to customer contact.</p> <p>This is automated e-mail hence please do not reply back</p>'  // html body
			};

			SendMail(mailOptions)
		}

	});

	res.json("success");

});


router.get('/api/needinfo', function (req, res) {
		// setup email data with unicode symbols
		let mailOptions = {
			from: 'noReply@hexaware.com', // sender address 
			to: 'vyjayanthis@hexaware.com', // list of receivers
			subject: 'Need more Information', // Subject line
			//text: 'Hello Sir / Madam, The customer M/S ABC needs information on the bidding process for financing his purchase. Please contact the customer in this regard. This is automated e-mail hence please do not reply back'
			// plain text body
			html: '<b>Hello Sir/Madam,</b> </br> <p>The customer M/S ABC needs information on the bidding process for financing his purchase. Please contact the customer in this regard.</p> <p>This is automated e-mail hence please do not reply back.</p>' // html body
		};

		SendMail(mailOptions)
});

router.post('/api/withoutmsg', function (req, res) {
	// setup email data with unicode symbols
	//var extraTxt = req.body.extraNote;
	let mailOptions = {
		from: 'noReply@hexaware.com', // sender address 
		to: 'vyjayanthis@hexaware.com', // list of receivers
		subject: 'Final Submission', // Subject line
		//text: 'Hello Sir / Madam, The customer M/S ABC needs information on the bidding process for financing his purchase. Please contact the customer in this regard. This is automated e-mail hence please do not reply back'
		// plain text body
		html: '<b>Hello Sir/Madam,</b> </br> <p>The customer M/S ABC needs information on the bidding process for financing his purchase. Please contact the customer in this regard.</p> <p>This is automated e-mail hence please do not reply back.<p> <p>'+req.body.extraNote+'</p>' // html body
	};

	SendMail(mailOptions)
});


router.get('/api/search', function (req, res) {

	var options = getOptions();
	options.args = {};

	marbles_lib.getAllPO(options, function (err, poList) {
		if (err) {
			console.log('Retrieve all Assets failed:', err);
			return res.json({});
		} else {
			return res.json(poList.parsed);
		}
	})

});


router.post('/api/fileUploadtest', function (req, res, next) {

	var options = getOptions();
	options.args = {
		eventId: req.body.eventid,
		file_name: req.body.filename,
		//file_ext: req.body.filetype,
		contents: req.body.contents.toString('base64'),
	};


	marbles_lib.uploadDocument(options, function (err, user) {
		if (err) {
			console.error('Upload failed:', err);
		} else {
			//console.log('Uploaded Document:' + fileInfo.name + "::" + req.now);
		}
	})

})



router.post('/api/fileUpload', function (req, res, next) {
	var now = Date.now();
	req.now = now;
	jqupload.fileHandler({
		uploadDir: function () {
			return './public/uploads/' + now;
		},
		uploadUrl: function () {
			return '/uploads/' + now;
		},
	})(req, res, next);

})

jqupload.on('begin', function (fileInfo, req, res) {
	console.log("beginning upload:" + fileInfo.name + "::" + fileInfo.url);
});

jqupload.on('end', function (fileInfo, req, res) {
	console.log("end upload:" + fileInfo.name + "::" + fileInfo.url);
	var base64Str = base64_encode('./public/uploads/' + req.now + "/" + fileInfo.name);
	var options = getOptions();

	options.args = {
		shipment_id: req.session.shipmentId,
		file_name: fileInfo.name,
		contents: base64Str
	};

	// Registering the user against a peer can serve as a login checker, for now
	console.log('attempting login for:', req.body.username);
	marbles_lib.uploadDocument(options, function (err, user) {
		if (err) {
			console.error('Upload failed:', err);
		} else {
			//console.log('Uploaded Document:' + fileInfo.name + "::" + req.now);
		}
	})
});

// jqupload.on('abort', function (fileInfo, req, res) {
// 	console.log('Abort Document upload:' + fileInfo.name + "::" + req.now);
// });

jqupload.on('delete', function (fileInfo, req, res) {
	console.log('Delete Document:' + fileInfo.name + "::" + req.now);
});

jqupload.on('error', function (e, req, res) {
	console.log("Error jqupload :" + e.message);
});


function isAuthenticated(req, res, next) {
	if (!req.session.username || req.session.username === '') {
		console.log('! not logged in, redirecting to login');
		return res.redirect('/login');
	}

	console.log('user is logged in');
	next();
}

/**
 * Handles form posts for enrollment requests.
 * @param req The request containing the enroll form data.
 * @param res The response.
 */
function login(req, res) {
	console.log('site_router.js login() - fired :' + req);

	var options = getOptions();

	options.args = {
		'username': req.body.username,
		'password': req.body.password
	};

	// Registering the user against a peer can serve as a login checker, for now
	console.log('attempting login for:' + req.body.username);
	marbles_lib.login(options, function (err, user) {
		if (err) {
			console.error('Login failed:' + err);
			//return res.redirect('/login');
			return res.json();
		} else {
			console.log(JSON.stringify(user));
			var userJSON = user.parsed;
			req.session.role = userJSON.role;
			req.session.username = userJSON.userName;
			return res.json(user.parsed);
			//retrieveLCApplications(req, res);
		}
	});
}

function retrieveLCApplications(req, res) {

	var options = getOptions();

	options.args = {};

	marbles_lib.getAllLCs(options, function (err, lcList) {
		if (err) {
			console.log('Retrieve all LCs failed:', err);
			return res.render('lcList', { lcApplications: {} });
		} else {
			var user = req.session.username;
			var showCreate = (user == 'buyer') ? 'inline-block' : 'none';
			console.log('obtained lcList:' + JSON.stringify(lcList.parsed));
			return res.render('lcList', {
				lcApplications: lcList.parsed,
				role: req.session.role, date: formatDate(new Date()), username: user,
				createVisible: showCreate
			});
		}
	})
}

function getDocument(req, res) {
	debugger;

	var options = getOptions();

	options.args = {
		eventId: req.query.eventId,
		file_name: req.query.file,
		//file_ext: req.query.filetype
	};

	marbles_lib.fileView(options, function (err, resp) {
		if (err != null) {
			console.log('Get File failed:', err);
		} else {
			console.log('Got file bytes from blockchain:' + resp.parsed);
			//var data = base64_decode(JSON.stringify(resp.parsed));
			var data = base64_decode((resp.parsed));
			res.writeHead(200, { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
			res.end(data, 'binary');
		}
	});
	console.log("Getting out of get document");
}

module.exports = router;

module.exports.setup_helpers = function (configured_marbles_lib, configured_enrollObj) {
	if (!configured_marbles_lib)
		throw new Error('Router needs a marbles_lib in order to function');
	marbles_lib = configured_marbles_lib;
	enrollObj = configured_enrollObj;
}


