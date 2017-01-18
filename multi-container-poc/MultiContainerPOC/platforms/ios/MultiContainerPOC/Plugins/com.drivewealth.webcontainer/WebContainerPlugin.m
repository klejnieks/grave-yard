
#include <sys/types.h>
#include <sys/sysctl.h>

#import <Cordova/CDV.h>
#import "WebContainerPlugin.h"

@implementation WebContainerPlugin

@synthesize webContainerController;

- (void)subscribeCallback:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            webContainerFinishedCallBack = command.callbackId;
        }
        @catch (NSException *exception) {
            NSString* reason=[exception reason];
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: reason];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
    }];
}

- (void)add2:(CDVInvokedUrlCommand*)command{
    NSString* url=(NSString*)[command.arguments objectAtIndex:0];
    NSLog(@"add webViewView %@", url);
    [self.commandDelegate runInBackground:^{
        @try {
            dispatch_async(dispatch_get_main_queue(), ^{
                webContainerController = [[WebContainerController alloc] init];
                webContainerController.delegate = self;
                webContainerController.startPage = url;
                
                [self.viewController addChildViewController:webContainerController];
                [self.webContainerController.view setFrame:CGRectMake(0.0f, 180, self.viewController.view.frame.size.width, self.viewController.view.frame.size.height)];
                
                [self.viewController.view addSubview:self.webContainerController.view];
                [self.viewController didMoveToParentViewController:self.webContainerController];
                
                self.webContainerController.view.opaque = NO;
                self.webContainerController.view.backgroundColor = [UIColor clearColor];
                
                self.webContainerController.webView.opaque = NO;
                self.webContainerController.webView.backgroundColor = [UIColor clearColor];
            });
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
        @catch (NSException *exception) {
            NSString* reason=[exception reason];
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: reason];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
    }];
}

- (void)add:(CDVInvokedUrlCommand*)command{
    NSString* url=(NSString*)[command.arguments objectAtIndex:0];
    NSLog(@"add webViewView %@", url);
    [self.commandDelegate runInBackground:^{
        @try {
            dispatch_async(dispatch_get_main_queue(), ^{
                webContainerController = [[WebContainerController alloc] init];
                webContainerController.delegate = self;
                webContainerController.startPage = url;
                
                [self.viewController addChildViewController:webContainerController];
                [self.webContainerController.view setFrame:CGRectMake(0.0f, 28, self.viewController.view.frame.size.width, self.viewController.view.frame.size.height)];
                
                [self.viewController.view addSubview:self.webContainerController.view];
                [self.viewController didMoveToParentViewController:self.webContainerController];
                
                self.webContainerController.view.opaque = NO;
                self.webContainerController.view.backgroundColor = [UIColor colorWithRed:0.40 green:0.80 blue:0.80 alpha:1.0];
                
                self.webContainerController.webView.opaque = NO;
                self.webContainerController.webView.backgroundColor = [UIColor colorWithRed:0.40 green:0.80 blue:0.80 alpha:1.0];
            });
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
        @catch (NSException *exception) {
            NSString* reason=[exception reason];
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: reason];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
    }];
}



/////////////////////////////////
//PORTFOLIO
/////////////////////////////////
- (void)addPortfolio:(CDVInvokedUrlCommand*)command{
    NSString* url=(NSString*)[command.arguments objectAtIndex:0];
    NSLog(@"add webViewView %@", url);
    [self.commandDelegate runInBackground:^{
        @try {
            dispatch_async(dispatch_get_main_queue(), ^{
            	
			UIView *modalView = [[UIView alloc] initWithFrame: CGRectMake ( 0, 0, self.viewController.view.frame.size.width, self.viewController.view.frame.size.height)];
			//add code to customize, e.g. polygonView.backgroundColor = [UIColor blackColor];
			modalView.tag = 10;
			modalView.backgroundColor = [UIColor colorWithRed:0.00 green:0.00 blue:0.00 alpha:0.6];
            
                [self.viewController.view addSubview:modalView];
            	
                webContainerController = [[WebContainerController alloc] init];
                webContainerController.delegate = self;
                webContainerController.startPage = url;
                
                [self.viewController addChildViewController:webContainerController];
                [self.webContainerController.view setFrame:CGRectMake(0.0f, 28, self.viewController.view.frame.size.width, self.viewController.view.frame.size.height)];
                
                [self.viewController.view addSubview:self.webContainerController.view];
                [self.viewController didMoveToParentViewController:self.webContainerController];
                
                self.webContainerController.view.opaque = NO;
                self.webContainerController.view.backgroundColor = [UIColor colorWithRed:0.40 green:0.80 blue:0.80 alpha:1.0];
                
                self.webContainerController.webView.opaque = NO;
                self.webContainerController.webView.backgroundColor = [UIColor colorWithRed:0.40 green:0.80 blue:0.80 alpha:1.0];
                
                self.webContainerController.webView.scrollView.bounces = NO;
            });
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
        @catch (NSException *exception) {
            NSString* reason=[exception reason];
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: reason];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
    }];
}

- (void)removePortfolio:(CDVInvokedUrlCommand*)command{
    NSLog(@"remove webview");
    //[self.viewController removeFromParentViewController];
    
    //[webViewController.view removeFromSuperview];
    CGRect newFrame = self.viewController.view.frame;
    newFrame.origin.y = self.viewController.view.frame.size.height - 65;
    
    [UIView animateWithDuration:1.0
                     animations:^{
                         self.viewController.view.frame = newFrame;
                     }];
    
    //[webViewController removeFromParentViewController];
    //[webViewController willMoveToParentViewController:self.viewController];
    
    //[self dispose];
    //});
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}

- (void)showPortfolio:(CDVInvokedUrlCommand*)command{
 	

    
	UIView *modalView = (UIView*)[self.viewController.view.superview viewWithTag:10];
		modalView.backgroundColor = [UIColor colorWithRed:0.00 green:0.00 blue:0.00 alpha:0.0]; 
		modalView.hidden = false;
		
	[UIView animateWithDuration:0.40 animations:^() {
    modalView.backgroundColor = [UIColor colorWithRed:0.00 green:0.00 blue:0.00 alpha:0.6]; 
}];     
            
    dispatch_async(dispatch_get_main_queue(), ^{
        CGRect newFrame = self.viewController.view.frame;
        newFrame.origin.y = 28;
          
                [UIView animateWithDuration: 0.20
                delay: 0.0
                options: UIViewAnimationOptionCurveEaseOut
                animations: ^{
                    self.viewController.view.frame = newFrame;
                }
                completion: nil
         ];


    });

}

- (void)hidePortfolio:(CDVInvokedUrlCommand*)command{
  NSLog(@"hidewebViewView");
  //[self.commandDelegate runInBackground:^{
    //@try {

      //dispatch_async(dispatch_get_main_queue(), ^{
        //[self.viewController removeFromParentViewController];
          
          //[webViewController.view removeFromSuperview];
          
      UIView *modalView = (UIView*)[self.viewController.view.superview viewWithTag:10];
		modalView.backgroundColor = [UIColor colorWithRed:0.00 green:0.00 blue:0.00 alpha:0.6];

	[UIView animateWithDuration:0.18 animations:^() {
    modalView.backgroundColor = [UIColor colorWithRed:0.00 green:0.00 blue:0.00 alpha:0.0]; 
}
                     completion: ^(BOOL finished){
                         UIView *modalView = (UIView*)[self.viewController.view.superview viewWithTag:10];
                         modalView.hidden = true;
                     }];

      CGRect newFrame = self.viewController.view.frame;
      newFrame.origin.y = self.viewController.view.frame.size.height - 40;
      
              [UIView animateWithDuration: 0.25
                delay: 0.0
                options: UIViewAnimationOptionCurveEaseOut
                animations: ^{
                    self.viewController.view.frame = newFrame;
                }
                completion: nil
         ];

      
    //NSString* jsString = [NSString stringWithFormat:@"lejnieks();"];
	//[self.webContainerController.webView stringByEvaluatingJavaScriptFromString:jsString];

          //[webViewController removeFromParentViewController];
          //[webViewController willMoveToParentViewController:self.viewController];
          
        //[self dispose];
      //});
        
        //[UIView animateWithDuration:0.5f animations:^{
          //  webViewController.view.frame = CGRectOffset(webViewController.view.frame, 0, 250);
        //}];
        
        //[UIView setAnimationDuration:1.0];
        //[UIView setAnimationTransition:UIViewAnimationTransitionCurlDown forView:self.viewController.view cache:YES];
        
        //[UIView commitAnimations];

      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    //}
    //@catch (NSException *exception) {
      //NSString* reason=[exception reason];
      //CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: reason];
      //[self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    //}
  //}];
}




/////////////////////////////////
//INSTRUMENT
/////////////////////////////////
- (void)addInstrumentCard:(CDVInvokedUrlCommand*)command{
    NSString* url=(NSString*)[command.arguments objectAtIndex:0];
    NSLog(@"add webViewView %@", url);
    [self.commandDelegate runInBackground:^{
        @try {
            dispatch_async(dispatch_get_main_queue(), ^{
            	
			UIView *modalView = [[UIView alloc] initWithFrame: CGRectMake ( 0, 0, self.viewController.view.frame.size.width, self.viewController.view.frame.size.height)];
			//add code to customize, e.g. polygonView.backgroundColor = [UIColor blackColor];
			modalView.tag = 5;
			modalView.backgroundColor = [UIColor colorWithRed:0.00 green:0.00 blue:0.00 alpha:0.6];
			
                [self.viewController.view addSubview:modalView];
            	
                webContainerController = [[WebContainerController alloc] init];
                webContainerController.delegate = self;
                webContainerController.startPage = url;

                [self.viewController addChildViewController:webContainerController];
                [self.webContainerController.view setFrame:CGRectMake(10, 28, self.viewController.view.frame.size.width - 20, self.viewController.view.frame.size.height)];
                
                [self.viewController.view addSubview:self.webContainerController.view];
                [self.viewController didMoveToParentViewController:self.webContainerController];
                
                self.webContainerController.view.opaque = NO;
                self.webContainerController.view.backgroundColor = [UIColor clearColor];
                
                self.webContainerController.webView.opaque = NO;
                self.webContainerController.webView.backgroundColor = [UIColor clearColor];
                
                //self.webContainerController.webView.scrollView.bounces = NO;
            });
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
        @catch (NSException *exception) {
            NSString* reason=[exception reason];
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: reason];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
    }];
}

- (void)removeInstrumentCard:(CDVInvokedUrlCommand*)command{
    NSLog(@"remove webview");
    //[self.viewController removeFromParentViewController];
    
    //[webViewController.view removeFromSuperview];
    CGRect newFrame = self.viewController.view.frame;
    newFrame.origin.y = self.viewController.view.frame.size.height - 65;
    
    [UIView animateWithDuration:1.0
                     animations:^{
                         self.viewController.view.frame = newFrame;
                     }];
    
    //[webViewController removeFromParentViewController];
    //[webViewController willMoveToParentViewController:self.viewController];
    
    //[self dispose];
    //});
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}

- (void)showInstrumentCard:(CDVInvokedUrlCommand*)command{
 	

    
	UIView *modalView = (UIView*)[self.viewController.view.superview viewWithTag:5];
		modalView.backgroundColor = [UIColor colorWithRed:0.00 green:0.00 blue:0.00 alpha:0.0]; 
		modalView.hidden = false;
		
	[UIView animateWithDuration:0.40 animations:^() {
    modalView.backgroundColor = [UIColor colorWithRed:0.00 green:0.00 blue:0.00 alpha:0.6]; 
}];     
            
    dispatch_async(dispatch_get_main_queue(), ^{
        CGRect newFrame = self.viewController.view.frame;
        newFrame.origin.y = 28;
          
                [UIView animateWithDuration: 0.20
                delay: 0.0
                options: UIViewAnimationOptionCurveEaseOut
                animations: ^{
                    self.viewController.view.frame = newFrame;
                }
                completion: nil
         ];


    });

}

- (void)hideInstrumentCard:(CDVInvokedUrlCommand*)command{
  NSLog(@"hidewebViewView");
  //[self.commandDelegate runInBackground:^{
    //@try {

      //dispatch_async(dispatch_get_main_queue(), ^{
        //[self.viewController removeFromParentViewController];
          
          //[webViewController.view removeFromSuperview];
          
      UIView *modalView = (UIView*)[self.viewController.view.superview viewWithTag:5];
		modalView.backgroundColor = [UIColor colorWithRed:0.00 green:0.00 blue:0.00 alpha:0.6];

	[UIView animateWithDuration:0.18 animations:^() {
    modalView.backgroundColor = [UIColor colorWithRed:0.00 green:0.00 blue:0.00 alpha:0.0]; 
}
                     completion: ^(BOOL finished){
                         UIView *modalView = (UIView*)[self.viewController.view.superview viewWithTag:5];
                         modalView.hidden = true;
                     }];

      CGRect newFrame = self.viewController.view.frame;
      newFrame.origin.y = self.viewController.view.frame.size.height;
      
              [UIView animateWithDuration: 0.25
                delay: 0.0
                options: UIViewAnimationOptionCurveEaseOut
                animations: ^{
                    self.viewController.view.frame = newFrame;
                }
                completion: nil
         ];

      
    //NSString* jsString = [NSString stringWithFormat:@"lejnieks();"];
	//[self.webContainerController.webView stringByEvaluatingJavaScriptFromString:jsString];

          //[webViewController removeFromParentViewController];
          //[webViewController willMoveToParentViewController:self.viewController];
          
        //[self dispose];
      //});
        
        //[UIView animateWithDuration:0.5f animations:^{
          //  webViewController.view.frame = CGRectOffset(webViewController.view.frame, 0, 250);
        //}];
        
        //[UIView setAnimationDuration:1.0];
        //[UIView setAnimationTransition:UIViewAnimationTransitionCurlDown forView:self.viewController.view cache:YES];
        
        //[UIView commitAnimations];

      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    //}
    //@catch (NSException *exception) {
      //NSString* reason=[exception reason];
      //CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: reason];
      //[self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    //}
  //}];
}



//////////////////////////
//////////////////////////
- (void)remove:(CDVInvokedUrlCommand*)command{
    NSLog(@"remove webview");
    //[self.viewController removeFromParentViewController];
    
    //[webViewController.view removeFromSuperview];
    CGRect newFrame = self.viewController.view.frame;
    newFrame.origin.y = self.viewController.view.frame.size.height - 65;
    
    [UIView animateWithDuration:1.0
                     animations:^{
                         self.viewController.view.frame = newFrame;
                     }];
    
    //[webViewController removeFromParentViewController];
    //[webViewController willMoveToParentViewController:self.viewController];
    
    //[self dispose];
    //});
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}



- (void)show:(CDVInvokedUrlCommand*)command{
 
    dispatch_async(dispatch_get_main_queue(), ^{
        CGRect newFrame = self.viewController.view.frame;
        newFrame.origin.y = 0;
          
        [UIView animateWithDuration:1.0
                           animations:^{
                               self.viewController.view.frame = newFrame;
                           }];

    });

}


- (void)hide:(CDVInvokedUrlCommand*)command{
  NSLog(@"hidewebViewView");
  //[self.commandDelegate runInBackground:^{
    //@try {

      //dispatch_async(dispatch_get_main_queue(), ^{
        //[self.viewController removeFromParentViewController];
          
          //[webViewController.view removeFromSuperview];
          
      
      
      CGRect newFrame = self.viewController.view.frame;
      newFrame.origin.y = self.viewController.view.frame.size.height - 40;
      
      [UIView animateWithDuration:1.0
                       animations:^{
                           self.viewController.view.frame = newFrame;
                       }];
      
    //NSString* jsString = [NSString stringWithFormat:@"lejnieks();"];
	//[self.webContainerController.webView stringByEvaluatingJavaScriptFromString:jsString];

          //[webViewController removeFromParentViewController];
          //[webViewController willMoveToParentViewController:self.viewController];
          
        //[self dispose];
      //});
        
        //[UIView animateWithDuration:0.5f animations:^{
          //  webViewController.view.frame = CGRectOffset(webViewController.view.frame, 0, 250);
        //}];
        
        //[UIView setAnimationDuration:1.0];
        //[UIView setAnimationTransition:UIViewAnimationTransitionCurlDown forView:self.viewController.view cache:YES];
        
        //[UIView commitAnimations];

      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    //}
    //@catch (NSException *exception) {
      //NSString* reason=[exception reason];
      //CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: reason];
      //[self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    //}
  //}];
}


- (void)test:(CDVInvokedUrlCommand*)command{
  NSLog(@"Test Function");
  
}

-(void)webContainerFinished{
  NSLog(@"webViewFinished");
  webContainerController = nil;

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:webContainerFinishedCallBack];
}

@end

@implementation WebContainerController

@synthesize delegate;

- (id)init {
  self = [super init];
  return self;
}

- (void)viewDidDisappear:(BOOL)animated {
  NSLog(@"viewDidDisappear");
  [super viewDidDisappear:animated];
  [delegate webContainerFinished];
  delegate = nil;
}
@end
