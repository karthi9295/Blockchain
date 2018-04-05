/*
Copyright IBM Corp 2016 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"math/rand"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

type LoginInfo struct {
	Username	string	`json:"userName"`
	Password	string	`json:"password"`
}

type User struct {
	Username 		string `json:"userName"`
	Role		 	string `json:"role"`
	Password		string `json:"password"`
	DisplayName		string `json:"displayName"`
	UserID			string `json:"userID"`
}

type PO struct {
	EventID 		string `json:"eventID"`
	Customername		 	string `json:"customerName"`
	CustomerID		string `json:"customerID"`
	PONumber		string `json:"pONumber"`
	Itemcode 		string `json:"itemCode"`
	Itemdesc		 	string `json:"itemDesc"`
	Quantity		string `json:"quantity"`
	Amount 		string `json:"amount"`
	PODate		 	string `json:"pODate"`
	RejectDate		string `json:"rejectDate"`
	Status 		string `json:"status"`
	Role		 	string `json:"role"`
	IsOldPO   string `json:"isOldPO"`
	UniquePONumber		string `json:"uniquePONumber"`
	CreatedDate		string `json:"createdDate"`
	Lessor1				string  `json:"lessor1"`
	Lessor2				string  `json:"lessor2"`
	Lessor1ROI				string  `json:"lessor1ROI"`
	Lessor2ROI				string  `json:"lessor2ROI"`
	Lessor1FileName			string  `json:"lessor1FileName"`
	Lessor2FileName			string  `json:"lessor2FileName"`
	Lessor1FileExt			string  `json:"lessor1FileExt"`
	Lessor2FileExt			string  `json:"lessor2FileExt"`
	ExtraNote			string  `json:"extraNote"`
		
}



type LC struct {
	ShipmentId				string	  `json:"shipmentId"`
	PONumber				string	  `json:"pONumber"`
	PODate				string	  `json:"pODate"`
	SupplierCode				string	  `json:"supplierCode"`
	SupplierName				string	  `json:"supplierName"`

	SupplierCountry			string	  `json:"supplierCountry"`
	SupplierPOAcceptanceRequired			string	  `json:"supplierPOAcceptanceRequired"`
	MatchApprovalLevel			string	  `json:"matchApprovalLevel"`
	CurrencyType			string	  `json:"currencyType"`
	POTotalAmount			string	  `json:"pOTotalAmount"`
	PaymentTerms				string	  `json:"paymentTerms"`
	Freight				string    `json:"freight"`
	OrderCreationDate				string    `json:"orderCreationDate"`
	ItemCode			string	  `json:"itemCode"`
	ItemDescription			string	  `json:"itemDescription"`
	ItemQuantity			string  `json:"itemQuantity"`
	UnitPrice	string	  `json:"unitPrice"`
	LineItemTotal	string	  `json:"lineItemTotal"`
  RejectedReason	string	  `json:"rejectedReason"`

	ContentDescription		string	  `json:"contentDesc"`
	ContentValue			float32	  `json:"contentValue"`
	ExporterCompany			string	  `json:"exporterCompany"`
	ExporterBank			string	  `json:"exporterBank"`
	ImporterCompany			string	  `json:"importerCompany"`
	ImporterBank			string	  `json:"importerBank"`
	FreightCompany			string	  `json:"freightCompany"`
	PortOfLoading			string	  `json:"portOfLoading"`
	PortOfEntry				string	  `json:"portOfEntry"`
	IssueDate				string    `json:"issueDate"`
	ExpiryDate				string    `json:"expiryDate"`
	CurrentStatus			string	  `json:"currentStatus"`
	DocumentNames			[]string  `json:"documentNames"`
	ExporterBankApproved	bool	  `json:"exporterBankApproved"`
	ExporterDocsUploaded	bool	  `json:"exporterDocsUploaded"`
	CustomsApproved			bool	  `json:"customsApproved"`
	PaymentComplete			bool	  `json:"paymentComplete"`
}

// ============================================================================================================================
// Main
// ============================================================================================================================
func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

// Init resets all the things
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Init firing.")

	// Initialize the collection of commercial paper keys
	fmt.Println("Initializing user accounts")
	t.createUser(stub, []string{"ricoh", "ricoh", "Ricoh","Ricoh",""})
	t.createUser(stub, []string{"customer1", "customer", "Customer","Mike","cust1"})
	t.createUser(stub, []string{"customer2", "customer", "Customer","Michael","cust2"})
	t.createUser(stub, []string{"customer3", "customer", "Customer","John","cust3"})
	t.createUser(stub, []string{"bank1", "bank", "Bank","Bank Of America","BK01"})
	t.createUser(stub, []string{"bank2", "bank", "Bank","JP Morgan","BK02"})
//	t.createUser(stub, []string{"exporter", "exporter", "Exporter"})

	fmt.Println("Initializing LC keys collection if not present")
	valAsbytes, err := stub.GetState("LCKeys")
	if err == nil {
		var keys []string
		err = json.Unmarshal(valAsbytes, &keys)
		fmt.Println("Existing LC : %v", keys);
		if len(keys) == 0 {
			keysBytesToWrite, _ := json.Marshal(keys)
			err = stub.PutState("LCKeys", keysBytesToWrite)
			if err != nil {
				fmt.Println("Failed to initialize LC key collection")
			}
		} else {
			for _, key := range keys {
				valAsbytes, err := stub.GetState(key)
				if err == nil {
					var lc LC
					err = json.Unmarshal(valAsbytes, &lc)
					if err == nil {
						if lc.CurrentStatus == "" {
							lc.CurrentStatus = "Created"
							keysBytesToWrite, _ := json.Marshal(lc)
							if err == nil {
								err = stub.PutState(key, keysBytesToWrite)
								if err != nil {
									fmt.Println("Error writing LC to chain" + err.Error())
								}
							}
						}
					}
				}
			}
		}
	}

	fmt.Println("Initialization complete")
	return shim.Success(nil)
}

//============================================================================================================================
//Query - legacy function
//============================================================================================================================
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Error("Unknown supported call - Query()")
}

//Invoke is our entry point to invoke a chaincode function
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println("invoke is running " + function)
	// Handle different functions
	if function == "init" {//initialize the chaincode state, used as reset
		return t.Init(stub)
	} else if function == "read" {                            //read a variable
        return t.read(stub, args)
    } else if function == "login" {
		return t.Login(stub, args)
    } else if function == "fileView" {
		return t.fileView(stub, args)
    } else if function == "getAllPOs" {
		fmt.Println("Getting all POs")
		return t.getAllPOs(stub)
    } else if function == "write" {
		return t.write(stub, args)
	} else if function == "createUser" {
		return t.createUser(stub, args)
	} else if function == "UpdatePO" {	//code change
		return t.UpdatePO(stub, args)
	} else if function == "addAPIPO" {
		return t.addAPIPO(stub, args)
	} else if function == "createLC" {
		return t.createLC(stub, args)
	} else if function == "uploadDocument" {
		fmt.Println("running uploadDocument>>>>>>>>>")
		return t.uploadDocument(stub, args)
	} else if function == "updateStatus" {
		return t.updateStatus(stub, args)
	}
	fmt.Println("invoke did not find func: " + function)					//error

	return shim.Error("Received unknown function invocation: " + function)
}

func (t *SimpleChaincode) addAPIPO(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	fmt.Println("adding PO")

	if len(args) != 1 {
		fmt.Println("Error obtaining Asset JSON string")
		return shim.Error("addAsset accepts 1 argument (AssetJSONString)")
	}

	var asset PO
	var err error
	fmt.Println("Unmarshalling Asset");

	err = json.Unmarshal([]byte(args[0]), &asset)
	if err != nil {
		fmt.Println("error invalid Asset string")
		return shim.Error("Invalid Asset string")
	}

	// var shipmentId string
	// shipmentId = lc.ShipmentId 
	var PONumber string
	PONumber = asset.PONumber 

	existingBytes, err := stub.GetState(PONumber);
			if err == nil {
				var existingAsset PO
				err = json.Unmarshal(existingBytes, &existingAsset)
				if existingAsset.PONumber != "" {
				existingAsset.PONumber = PONumber
				existingAsset.UniquePONumber = asset.PONumber +"_"+strconv.Itoa(rand.Intn(99999))
				existingAsset.IsOldPO ="Y"
				PONumber = existingAsset.UniquePONumber
				existingBytes, err := json.Marshal(&existingAsset)
				if err != nil {
					fmt.Println("Error marshalling lc")
					return shim.Error("Error marshalling LC")
				}
				err = stub.PutState(PONumber, existingBytes)
				addKey(stub, PONumber)
			}

			PONumber = asset.PONumber 
		existingAsset.PONumber = asset.PONumber
		existingAsset.EventID=asset.EventID
		existingAsset.Customername=asset.Customername
		existingAsset.CustomerID=asset.CustomerID
		existingAsset.Itemcode=asset.Itemcode
		existingAsset.Itemdesc=asset.Itemdesc
		existingAsset.Quantity=asset.Quantity
		existingAsset.Amount=asset.Amount
		existingAsset.PODate=asset.PODate
		existingAsset.RejectDate=asset.RejectDate
		existingAsset.Status=asset.Status
		existingAsset.Role=asset.Role
		existingAsset.UniquePONumber = asset.PONumber +"_"+strconv.Itoa(rand.Intn(99999))
		existingAsset.IsOldPO ="N"
		existingBytes, err := json.Marshal(&existingAsset)
		if err != nil {
			fmt.Println("Error asset lc")
			return shim.Error("Error asset LC")
		}
		err = stub.PutState(PONumber, existingBytes)
		fmt.Println("Marshalling asset bytes to write")
	
		addKey(stub, PONumber)
		
		fmt.Println("Asset Creation success", asset);
	 }
	
	return shim.Success(nil)
}



func addKey(stub shim.ChaincodeStubInterface, PONumber string)bool{
	// Update the LC keys by adding the new key
	fmt.Println("Getting LC Keys")
	keysBytes, err := stub.GetState("LCKeys")
	if err != nil {
		fmt.Println("Error retrieving LC keys")
		return false
		//return shim.Error("Error retrieving LC keys")
	}
	var keys []string
	err = json.Unmarshal(keysBytes, &keys)
	if err != nil {
		fmt.Println("Error unmarshel keys")
		return false
		//return shim.Error("Error unmarshalling LC keys ")
	}

	fmt.Println("Appending the new key to LC Keys")
	foundKey := false
	for _, key := range keys {
		if key == PONumber {
			foundKey = true
		}
	}
	if foundKey == false {
		keys = append(keys, PONumber)
		keysBytesToWrite, _ := json.Marshal(keys)
		if err != nil {
			fmt.Println("Error marshalling keys")
			return false
			//return shim.Error("Error marshalling the keys")
		}
		fmt.Println("Put state on PaperKeys")
		err = stub.PutState("LCKeys", keysBytesToWrite)
		if err != nil {
			fmt.Println("Error writting keys back")
			return false
			//return shim.Error("Error writing the keys back")
		}
	}

	return true
}



func (t *SimpleChaincode) Login(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("Inside Login method")
	var username, password, jsonResp string
	var err error

    if len(args) < 2 {
        return shim.Error("Incorrect number of arguments. Expecting username and password")
    }
    username = args[0]
	password = args[1]

    valAsbytes, err := stub.GetState(username)
		if err != nil {
        jsonResp = "{\"Error\":\"Username not found " + username + "\"}"
        return shim.Error(jsonResp)
    }
	var existingUser User
	json.Unmarshal(valAsbytes, &existingUser)

	fmt.Println("Login Password" +existingUser.Password)
	fmt.Println("Login Password" +password)

	if existingUser.Password != password {
		jsonResp = "{\"Error\":\"Password does not match for " + username + "\"}"
		return shim.Error(jsonResp)
	}
	fmt.Println("Login complete")
    return shim.Success(valAsbytes)
}

func (t *SimpleChaincode) UpdatePO(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	fmt.Println("adding PO")

	if len(args) != 1 {
		fmt.Println("Error obtaining Asset JSON string")
		return shim.Error("addAsset accepts 1 argument (AssetJSONString)")
	}

	var asset PO
	var err error
	fmt.Println("Unmarshalling Asset");

	err = json.Unmarshal([]byte(args[0]), &asset)
	if err != nil {
		fmt.Println("error invalid Asset string")
		return shim.Error("Invalid Asset string")
	}

	// var shipmentId string
	// shipmentId = lc.ShipmentId 
	var PONumber string
	PONumber = asset.PONumber 


	existingBytes, err := stub.GetState(PONumber);

	if err == nil {
		var existingAsset PO
		err = json.Unmarshal(existingBytes, &existingAsset)
		existingAsset.PONumber = asset.PONumber
		existingAsset.EventID = asset.EventID
		existingAsset.Customername=asset.Customername
		existingAsset.CustomerID=asset.CustomerID
		existingAsset.Itemcode=asset.Itemcode
		existingAsset.Itemdesc=asset.Itemdesc
		existingAsset.Quantity=asset.Quantity
		existingAsset.Amount=asset.Amount
		existingAsset.PODate=asset.PODate
		existingAsset.RejectDate=asset.RejectDate
		existingAsset.Status=asset.Status
		existingAsset.Role=asset.Role
		existingAsset.IsOldPO=asset.IsOldPO
		existingAsset.UniquePONumber=asset.UniquePONumber
		existingAsset.Lessor1=asset.Lessor1
		existingAsset.Lessor2=asset.Lessor2
		existingAsset.Lessor1ROI=asset.Lessor1ROI
		existingAsset.Lessor2ROI=asset.Lessor2ROI
		existingAsset.CreatedDate=asset.CreatedDate
		existingAsset.Lessor1FileName=asset.Lessor1FileName
		existingAsset.Lessor2FileName=asset.Lessor2FileName
		existingAsset.Lessor1FileExt=asset.Lessor1FileExt
		existingAsset.Lessor2FileExt=asset.Lessor2FileExt
		existingAsset.ExtraNote=asset.ExtraNote
		
		
		existingBytes, err := json.Marshal(&existingAsset)
		if err != nil {
			fmt.Println("Error marshalling lc")
			return shim.Error("Error marshalling LC")
		}
		err = stub.PutState(PONumber, existingBytes)
	} else {
		//lcBytes, _ := json.Marshal(lc)
		//asset.UpgradeStatus ="";
	//	asset.IsOldContract ="N";
		assetBytes, _ := json.Marshal(asset)
		if err != nil {
			fmt.Println("Error marshalling asset")
			return shim.Error("Error marshalling asset")
		}

		err = stub.PutState(PONumber, assetBytes)
		if err != nil {
			fmt.Println("Error creating asset")
			return shim.Error("Error creating asset")
		}
	}

	addKey(stub, PONumber);
	fmt.Println("Asset Creation success", asset);
	
	return shim.Success(nil)
}


func (t *SimpleChaincode) createLC(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("Creating LC")

	if len(args) != 1 {
		fmt.Println("Error obtaining LC JSON string")
		return shim.Error("createLC accepts 1 argument (LCJSONString)")
	}

	var lc LC
	var err error
	fmt.Println("Unmarshalling LC");

	err = json.Unmarshal([]byte(args[0]), &lc)
	if err != nil {
		fmt.Println("error invalid LC string")
		return shim.Error("Invalid LC string")
	}

	var shipmentId string
	shipmentId = lc.ShipmentId

  fmt.Println("Supplier P.O acceptance required value:" + lc.SupplierPOAcceptanceRequired)

  var rejectedReason string
  rejectedReason=""

//SC2 validation
	if lc.SupplierPOAcceptanceRequired == "N" {
		fmt.Println("Supplier P.O acceptance required should not be 'NONE'")
		rejectedReason="Acceptance is given as 'NONE',"
	}
	if lc.PaymentTerms != "15 Net (terms date + 15)" {
		fmt.Println("Pay by date (payment terms) should be 15 days")
		rejectedReason= rejectedReason +" Pay by date should be 15 days"
	}
	//End SC2 validation



	existingBytes, err := stub.GetState(shipmentId);

	lc.CurrentStatus = "OK"
	if rejectedReason !="" {
			lc.CurrentStatus = "SC 2 Rejected"
	}

	if err == nil {
		var existingLC LC
		err = json.Unmarshal(existingBytes, &existingLC)
		existingLC.ShipmentId = shipmentId
		existingLC.PONumber=lc.PONumber
		existingLC.PODate=lc.PODate
		existingLC.SupplierCode=lc.SupplierCode
		existingLC.SupplierName=lc.SupplierName
		existingLC.SupplierCountry=lc.SupplierCountry
		existingLC.SupplierPOAcceptanceRequired=lc.SupplierPOAcceptanceRequired
		existingLC.MatchApprovalLevel=lc.MatchApprovalLevel
		existingLC.CurrencyType=lc.CurrencyType
		existingLC.POTotalAmount=lc.POTotalAmount
		existingLC.PaymentTerms=lc.PaymentTerms
		existingLC.Freight=lc.Freight
		existingLC.OrderCreationDate=lc.OrderCreationDate
		existingLC.ItemCode=lc.ItemCode
		existingLC.ItemDescription=lc.ItemDescription
		existingLC.ItemQuantity=lc.ItemQuantity
		existingLC.UnitPrice=lc.UnitPrice
		existingLC.LineItemTotal=lc.LineItemTotal
		existingLC.RejectedReason=rejectedReason





		existingLC.ContentDescription =  lc.ContentDescription
		existingLC.ContentValue	= lc.ContentValue
		existingLC.ExporterCompany	= lc.ExporterCompany
		existingLC.ExporterBank	= lc.ExporterBank
		existingLC.ImporterCompany	= lc.ImporterCompany
		existingLC.ImporterBank	= lc.ImporterBank
		existingLC.FreightCompany	= lc.FreightCompany
		existingLC.PortOfLoading = lc.PortOfLoading
		existingLC.PortOfEntry	= lc.PortOfEntry
		existingLC.IssueDate = lc.IssueDate
		existingLC.ExpiryDate = lc.ExpiryDate
		existingLC.CurrentStatus = lc.CurrentStatus
		existingLC.DocumentNames	= []string{}
		existingLC.ExporterBankApproved	= false
		existingLC.ExporterDocsUploaded	= false
		existingLC.CustomsApproved	= false
		existingLC.PaymentComplete	= false
		existingBytes, err := json.Marshal(&existingLC)
		if err != nil {
			fmt.Println("Error marshalling lc")
			return shim.Error("Error marshalling LC")
		}
		err = stub.PutState(shipmentId, existingBytes)
	} else {
		lc.ExporterBankApproved = false
		lc.ExporterDocsUploaded = false
		lc.CustomsApproved = false
		lc.PaymentComplete = false
		lc.RejectedReason=rejectedReason

		lcBytes, _ := json.Marshal(lc)
		if err != nil {
			fmt.Println("Error marshalling lc")
			return shim.Error("Error marshalling LC")
		}

		err = stub.PutState(shipmentId, lcBytes)
		if err != nil {
			fmt.Println("Error creating LC")
			return shim.Error("Error creating LC")
		}
	}

	fmt.Println("Marshalling LC bytes to write")

	// Update the LC keys by adding the new key
	fmt.Println("Getting LC Keys")
	keysBytes, err := stub.GetState("LCKeys")
	if err != nil {
		fmt.Println("Error retrieving LC keys")
		return shim.Error("Error retrieving LC keys")
	}
	var keys []string
	err = json.Unmarshal(keysBytes, &keys)
	if err != nil {
		fmt.Println("Error unmarshel keys")
		return shim.Error("Error unmarshalling LC keys ")
	}

	fmt.Println("Appending the new key to LC Keys")
	foundKey := false
	for _, key := range keys {
		if key == lc.ShipmentId {
			foundKey = true
		}
	}
	if foundKey == false {
		keys = append(keys, lc.ShipmentId)
		keysBytesToWrite, _ := json.Marshal(keys)
		if err != nil {
			fmt.Println("Error marshalling keys")
			return shim.Error("Error marshalling the keys")
		}
		fmt.Println("Put state on PaperKeys")
		err = stub.PutState("LCKeys", keysBytesToWrite)
		if err != nil {
			fmt.Println("Error writting keys back")
			return shim.Error("Error writing the keys back")
		}
	}
	fmt.Println("LC Creation success", lc);

	/*var tosend = "LC created successfully for shipmentId :" + shipmentId + "." + stub.GetTxID();
    err = stub.SetEvent("invokeEvt", []byte(tosend))
    if err != nil {
        return nil, err
    } else {
    	fmt.Println("Error nill event sent");
    }*/

	return shim.Success(nil)
}

func (t *SimpleChaincode) createUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("Creating user")

	// Obtain the username to associate with the account
	if len(args) != 5 {
		fmt.Println("Error obtaining username/password/role")
		return shim.Error("createUser accepts 3 arguments (username, password, role)")
	}
	username := args[0]
	password := args[1]
	role 	:= args[2]
	dispName := args[3]
	userID := args[4]

	// Build an user object for the user
	var user = User{Username: username, Password: password, Role: role, DisplayName:dispName, UserID:userID }
	userBytes, err := json.Marshal(&user)
	if err != nil {
		fmt.Println("error creating user" + user.Username)
		return shim.Error("Error creating user " + user.Username)
	}

	fmt.Println("Attempting to get state of any existing account for " + user.Username)
	existingBytes, err := stub.GetState(user.Username)
	if err == nil {
		var existingUser User
		err = json.Unmarshal(existingBytes, &existingUser)
		if err != nil {
			fmt.Println("Error unmarshalling user " + user.Username + "\n--->: " + err.Error())

			if strings.Contains(err.Error(), "unexpected end") {
				fmt.Println("No data means existing user found for " + user.Username + ", initializing user.")
				err = stub.PutState(user.Username, userBytes)

				if err == nil {
					fmt.Println("created user" + user.Username)
					return shim.Success(nil)
				} else {
					fmt.Println("failed to create initialize user for " + user.Username)
					return shim.Error("failed to initialize an account for " + user.Username + " => " + err.Error())
				}
			} else {
				return shim.Error("Error unmarshalling existing account " + user.Username)
			}
		} else {
			fmt.Println("Account already exists for " + user.Username + " " + existingUser.Username)
			return shim.Error("Can't reinitialize existing user " + user.Username)
		}
	} else {

		fmt.Println("No existing user found for " + user.Username + ", initializing user.")
		err = stub.PutState(user.Username, userBytes)

		if err == nil {
			fmt.Println("created user" + user.Username)
			return shim.Success(nil)
		} else {
			fmt.Println("failed to create initialize user for " + user.Username)
			return shim.Error("failed to initialize an user for " + user.Username + " => " + err.Error())
		}

	}
}

func (t *SimpleChaincode) uploadDocument(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, value string
	var err error
	fmt.Println("running uploadDocument()")

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3. name of the key and value to set")
	}

	key = args[0]+"_"+args[1]                            //rename for fun
	fmt.Println("running uploadDocument()"+key)
	value = args[2]
	err = stub.PutState(key, []byte(value))  //write the variable into the chaincode state
	
	if err != nil {
		return shim.Error(err.Error())
	}

	//update document detail in LC JSON
	/*valAsbytes, err := stub.GetState(args[0])
	if err != nil {
	    jsonResp = "{\"Error\":\"LC JSON not found " + args[1] + "\"}"
	    return shim.Error(jsonResp)
	}

	var existingLC LC
	err = json.Unmarshal(valAsbytes, &existingLC)
	if err == nil {
		foundKey := false
		for _, key := range existingLC.DocumentNames {
			fmt.Println("Existing document :" + key)
			if key == args[1] {
				foundKey = true
			}
		}
		if foundKey == false {
			fmt.Println("Appending new document name : " + args[1]);
			existingLC.DocumentNames = append(existingLC.DocumentNames, args[1])
		}

		numdocs := len(existingLC.DocumentNames)
		fmt.Println("Number of documents : %d", numdocs)
		if numdocs >= 2 {
			fmt.Println("updating status")
			existingLC.ExporterDocsUploaded = true
			existingLC.CurrentStatus = "ExporterDocsUploaded"
		}
		lcBytes, _ := json.Marshal(existingLC)
		fmt.Println("ShipmentId after marshal :" + existingLC.ShipmentId)
		err = stub.PutState(args[0], lcBytes)
		if err != nil {
			fmt.Println("Error updating LC")
			return shim.Error("Error updating LC")
		}
		fmt.Println("Successfully updated")
	}*/

	return shim.Success(nil)
}

func (t *SimpleChaincode) getAllPOs(stub shim.ChaincodeStubInterface) pb.Response {

	var allPOs []PO

	// Get list of all the keys
	keysBytes, err := stub.GetState("LCKeys")
	if err != nil {
		fmt.Println("Error retrieving PO keys")
		return shim.Error("Error retrieving PO keys")
	}
	var keys []string
	err = json.Unmarshal(keysBytes, &keys)
	if err != nil {
		fmt.Println("Error unmarshalling PO keys" + err.Error())
		return shim.Error("Error unmarshalling PO keys")
	}

	// Get all the pos
	for _, value := range keys {
		poBytes, err := stub.GetState(value)

		var po PO
		err = json.Unmarshal(poBytes, &po)
		if err != nil {
			fmt.Println("Error retrieving po " + value)
			return shim.Error("Error retrieving po " + value)
		}

		fmt.Println("Appending PO" + value)
		allPOs = append(allPOs, po)
	}

	allPOsAsBytes, _ := json.Marshal(allPOs);
	return shim.Success(allPOsAsBytes)
}

func (t *SimpleChaincode) updateStatus(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error
	var key, jsonResp string
	fmt.Println("running updateStatus")

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3. updateStatus")
	}

	key = args[0]
	valAsbytes, err := stub.GetState(key)
	if err != nil {
	    jsonResp = "{\"Error\":\"File not found " + args[1] + "\"}"
	    return shim.Error(jsonResp)
	}

	var existingLC LC
	err = json.Unmarshal(valAsbytes, &existingLC)
	if err == nil {
		if args[1] == "SupplierInvoice" {
			existingLC.CurrentStatus = "InvoiceRaised"
		}	else if args[1] == "BuyerPayment" {
			existingLC.CurrentStatus = "PaymentReleased"
		}	else if args[1] == "ExporterBankApproved" {
			fmt.Println("running updateStatus ExporterBankApproved")
			value, err := strconv.ParseBool(args[2])
			if err == nil {
				if value == true {
					existingLC.ExporterBankApproved = value
					existingLC.CurrentStatus = "ExporterBankApproved"


        //SC3 validation
					if existingLC.MatchApprovalLevel == "4-Way" {
						existingLC.ExporterBankApproved = false
						existingLC.CurrentStatus = "SC 3 Rejected"
						existingLC.RejectedReason = "Match Approval level is given as '4-Way'"
					}

					//SC2 validation   second level checking
					if existingLC.SupplierPOAcceptanceRequired == "N" {
						existingLC.ExporterBankApproved = false
						existingLC.CurrentStatus = "SC 2 Rejected"
						existingLC.RejectedReason="Acceptance is given as 'NONE',"
					}
					if existingLC.PaymentTerms != "15 Net (terms date + 15)" {
						existingLC.ExporterBankApproved = false
						existingLC.CurrentStatus = "SC 2 Rejected"
						existingLC.RejectedReason= existingLC.RejectedReason +" Pay by date should be 15 days"
					}
					// End SC2 validation   second level checking


				} else {
					existingLC.ExporterBankApproved = value
					existingLC.CurrentStatus = "SupplierRejected"
					existingLC.RejectedReason = "Supplier Rejected"
				}

//sc 4 relate validiation
				if existingLC.ExporterBankApproved ==true {
					if  existingLC.Freight != "AIR" {
						 existingLC.ExporterBankApproved = false
						 existingLC.CurrentStatus = "SC 4 Rejected"
						 existingLC.RejectedReason = "Freight should be AIR, "
					 }

						if  existingLC.CurrencyType != "USD" {
						existingLC.ExporterBankApproved = false
						existingLC.CurrentStatus = "SC 4 Rejected"
						existingLC.RejectedReason = existingLC.RejectedReason+ "Currency should be USD"
					 }
		 	 }
			 //end sc 4 relate validiation

			 if existingLC.ExporterBankApproved == true  {
				 existingLC.CurrentStatus = "POCreated"
			 }

			}
		} else if args[1] == "ExporterDocsUploaded" {
			value, err := strconv.ParseBool(args[2])
			if err == nil {
				fmt.Println("Updating exporter docs uploaded %t", value)
				existingLC.ExporterDocsUploaded = value
				existingLC.CurrentStatus = "ExporterDocsUploaded"
			}
		} else if args[1] == "CustomsApproved" {
			value, err := strconv.ParseBool(args[2])
			if err == nil {
				if value == true {
					existingLC.CustomsApproved = value
					existingLC.CurrentStatus = "CustomsApproved"
				} else {
					existingLC.CustomsApproved = value
					existingLC.CurrentStatus = "CustomsRejected"
				}
			}
		} else if args[1] == "PaymentComplete" {
			value, err := strconv.ParseBool(args[2])
			if err == nil {
				existingLC.PaymentComplete = value
				existingLC.CurrentStatus = "PaymentComplete"
			}
		}
	} else {
		return shim.Error("Error unmarshalling LC")
	}

	lcBytes, _ := json.Marshal(existingLC)
		fmt.Println("Error updating LC" + existingLC.RejectedReason)

	err = stub.PutState(existingLC.ShipmentId, lcBytes)
	if err != nil {
		fmt.Println("Error updating LC")
		return shim.Error("Error updating LC")
	}
	fmt.Println("Status successfully updated")
	return shim.Success(nil)
}

func (t *SimpleChaincode) fileView(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("Inside fileView method")
	var key, jsonResp string
	var err error

    if len(args) < 2 {
        return shim.Error("Incorrect number of arguments. Expecting shipmentId, fileName")
    }

	key = args[0]+"_"+args[1]

    valAsbytes, err := stub.GetState(key)
	if err != nil {
	    jsonResp = "{\"Error\":\"File not found " + args[1] + "\"}"
	    return shim.Error(jsonResp)
	}
	fmt.Println("FileLoading complete")
    return shim.Success(valAsbytes)
}

func (t *SimpleChaincode) write(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, value string
	var err error
	fmt.Println("running write()")

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2. name of the key and value to set")
	}

	key = args[0]                            //rename for fun
	value = args[1]
	err = stub.PutState(key, []byte(value))  //write the variable into the chaincode state
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(nil)
}

func (t *SimpleChaincode) read(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, jsonResp string
	var err error

    if len(args) != 1 {
        return shim.Error("Incorrect number of arguments. Expecting name of the key to query")
    }

    key = args[0]
    valAsbytes, err := stub.GetState(key)
    if err != nil {
        jsonResp = "{\"Error\":\"Failed to get state for " + key + "\"}"
        return shim.Error(jsonResp)
    }
    return shim.Success(valAsbytes)
}
