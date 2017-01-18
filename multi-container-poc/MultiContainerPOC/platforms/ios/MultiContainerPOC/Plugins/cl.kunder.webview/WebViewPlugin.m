
#include <sys/types.h>
#include <sys/sysctl.h>

#import <Cordova/CDV.h>
#import "WebViewPlugin.h"

@implementation WebViewPlugin

@synthesize webViewController;

- (void)subscribeCallback:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            webViewFinishedCallBack = command.callbackId;
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
    NSLog(@"showwebViewView %@", url);
    [self.commandDelegate runInBackground:^{
        @try {
            dispatch_async(dispatch_get_main_queue(), ^{
                webViewController = [[WebViewController alloc] init];
                webViewController.delegate = self; // esto es para poder recibir el evento de que webView se cerro
                webViewController.startPage = url;
                
                [self.viewController addChildViewController:webViewController];
                [self.webViewController.view setFrame:CGRectMake(0.0f, 0.0f, self.viewController.view.frame.size.width, self.viewController.view.frame.size.height)];
                
                [self.viewController.view addSubview:self.webViewController.view];
                [self.viewController didMoveToParentViewController:self.webViewController];
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
      newFrame.origin.y = self.viewController.view.frame.size.height - 65;
      
      [UIView animateWithDuration:1.0
                       animations:^{
                           self.viewController.view.frame = newFrame;
                       }];
      
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

-(void)webViewFinished{
  NSLog(@"webViewFinished");
  webViewController = nil;

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:webViewFinishedCallBack];
}

@end

@implementation WebViewController

@synthesize delegate;

- (id)init {
  self = [super init];
  return self;
}

- (void)viewDidDisappear:(BOOL)animated {
  NSLog(@"viewDidDisappear");
  [super viewDidDisappear:animated];
  [delegate webViewFinished];
  delegate = nil;
}
@end
