

//data structure should be something like this
//the rel in the controller may look like this
// rel: "/web-ca/ca"
// rel: "/ca/customer-search"

//START URL: "/ca/customer-summary/edo"
//User clicks something to go to KYC

// NEW URL: "/ca/13245679812345679/kyc-web/kyc-login
//--------------KYC MODULE LOADS 
//--------------KYC ROUTER SEES ROUTER CONFIG HAS kyc-web as baseURL
//--------------KYC ROUTER LOADS PRIMARY Controller KYCLOgincController

//USER COMPLETE KYC MODULE



//CA = App (/ca/login)
//  ->customer-summary = App (/ca/customerSummary)
//      ->edo = APP (/ca/customerSummary/edo)
//          ->Step1 = APP (/ca/customerSummary/edo/step1)
//              ->KYC = Module(APP) (ca/customerSummary/edo/step1/kyc-web/12345678/kycLogin)
//                  ->CDDPage1 = Module (/ca/customerSummary/edo/step1/kyc-web/12345678/kycLogin/cddPage1)
//                  ->CDDPage2 = Module (/ca/customerSummary/edo/step1/kyc-web/12345678/kycLogin/cddPage2)
//                  |  ->CustomerSearch = Module (/ca/customerSummary/edo/step1/kyc-web/cddPage2/cs-web/4578963/csLogin)
//                  |--->CustomerPage1 = Module (/ca/customerSummary/edo/step1/kyc-web/cddPage2//cs-web/4578963/csPage2)
//                  ->CDDPage2 = Module (/ca/customerSummary/edo/step1/kyc-web/12345678/kycLogin/cddPage2)
//                  ->CDDPage3 = Module (/ca/customerSummary/edo/step1/kyc-web/12345678/kycLogin/cddPage3)
//          ->Step1 = APP (/ca/customerSummary/edo/step1)
//          ->Step2 = APP (/ca/customerSummary/edo/step2)
//...









//CA = App (/ca/login)	| CAApplicationController = primary controller  | NON VISUAL		| CAAppModel	| CAAppModel.CustSumModel, CAAppModel.KYCAppModel

//EXAMPLE SAVED STATE -> KYC
//CAAppModel.CustSumModel.EDOModel.EDOStep1Model.KYCResponseModel
//CAAppModel.CustSumModel.EDOStep1Model.KYCResponseModel

//CAAppModel.CustSumModel		//persistent
//CAAppModel.EDOModel			//persistent
//CAAppModel.EDOStep1Model		//transient
//CAAppModel.KYCResponseModel	//transient

//destroy() {
//	test if this conytroller model is transient or not
//	if it is transient then copy to parent model and remove from controller
// 	for instance when removing EDOStep1
// 	copy EDOStep1Model to EDOModel.step1
//}




//  ->customer-summary = App (/ca/customerSummary)	| CustomerSummaryController = [SECONDARY]/Primary Controller	| VISUAL	| CustSumModel | CustSumModel.EDOModel
//      ->edo = APP (/ca/customerSummary/edo)	| EDOController = Tertiary/Secondary/Primary controller		| EDOModel | EDOModel.EDOStep1Model, EDOModel.EDOStep2Model
//          ->Step1 = APP (/ca/customerSummary/edo/step1) | EDOStep1Controller	= Quad/Tertiary/Secondary/Primary Controller	

//	->KYC = Module(APP) (ca/customerSummary/edo/step1/kyc-web/12345678/kycLogin)	| KYCController = [SECONDARY] /Primary controller	| NON VISUAL	| KYCAppModel
//		->CDDPage1 = Module (/ca/customerSummary/edo/step1/kyc-web/12345678/kycLogin/cddPage1)	| KYCCDDPage1Controller = Tertiary/secondary/rpimary controller		| VISUAL
//		->CDDPage2 = Module (/ca/customerSummary/edo/step1/kyc-web/12345678/kycLogin/cddPage2)	| KYCCDDPage2Controller = Tertiary/secondary/rpimary controller		| VISUAL
//			->CustomerSearch = Module (/ca/customerSummary/edo/step1/kyc-web/cddPage2/cs-web/4578963/csLogin)		| CustomerSearchLoginController = Quad controller/Primary	| NON VISUAL
//			->CustomerPage1 = Module (/ca/customerSummary/edo/step1/kyc-web/cddPage2//cs-web/4578963/csPage2)		| CustomerSearchPage1Controller = Quad controller/Primary	| VISUAL
//		->CDDPage2 = Module (/ca/customerSummary/edo/step1/kyc-web/12345678/kycLogin/cddPage2)	| KYCCDDPage2Controller = Tertiary/secondary/rpimary controller	| VISUAL
//		->CDDPage3 = Module (/ca/customerSummary/edo/step1/kyc-web/12345678/kycLogin/cddPage3)	| KYCCDDPage3Controller = Tertiary/secondary/rpimary controller	| VISUAL
//		ON END OF KYC
//		SAVE DATA (State etc...) to EDOModel.EDOStep1Model.KYCResponseModel
//		CAAppModel.CustSumModel.EDOModel has last saved step
//		SAVE DATA (State etc...) to CAAppModel.KYCAppModel???


//			->Step1 = APP (/ca/customerSummary/edo/step1) 	| EDOStep1Controller	= Quad/Tertiary/Secondary/Primary Controller	| EDOStep1Model	
//			->Step2 = APP (/ca/customerSummary/edo/step2)	| EDOStep1Controller	= Quad/Tertiary/Secondary/Primary Controller	| EDOStep2Model


//...








//CA = App 
//  ->customer-summary = App
//      ->edo = APP
//          ->Step1 = APP

//->KYC = Module(APP)
//	->CDDPage1 = Module
//	->CDDPage2 = Module
//		->CustomerSearch = Module
//		->CustomerPage1 = Module
//->KYC ->CDDPage2
//	->CDDPage3 = Module

//CA ->customer-summary ->edo ->Step1






//END URL: "/ca/customer-summary/edo/step1" which server provides? Yes
//edo primary model = edo.model
//edo.model.step1Data
//edo.model.step2Data

//when KYC ends, and returns to EDO, 
//edo model has current state
//edo opens to last current state ie: step3
//edo loads model.step3 data first, then back filles step1, and 2
//CustomerSummaryController has model for state for edo.

//CustomerSummaryController.destroy() {
        //saveModelStateToParent()
        //SavePendingForHistorical()
    //}
//CAAPpplicationController.saveModelState()
//CAMOdel.SomeChild.StateData = {}




// rel: "/ca-login"
// rel: "/ca-logout"
