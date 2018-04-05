export interface Message {
	author: string,
	message: string
}

export class UserDetails {
	FirstName: string;
	LastName: string;
	Role: string;
  
}

export class UserDetailsInputParam {
	UserName: string;
    Password: string;
}

export interface UserDetailsData {
	InputParam: UserDetailsInputParam;
    Output: UserDetails;
    Key: string;
}

export class searchDetails {
	EventID: number;
    Customername: string;
	PONumber: number;
	Itemcode: string;
	Itemdesc: string;
	Quantity: number;
	Amount: number;
	PODate:string;
	RejectDate: string;
	Status: string;
	Role: string;
}

export class searchDetailsInputParam {
	Customername: string;
    PONumber: number;
}

export interface searchDeatilsData {
	InputParam: searchDetailsInputParam;
    Output: searchDetails[];
    Key: string;
}