/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

#import <UIKit/UIKit.h>
#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVViewController.h>

@class WebContainerController;

@protocol WebContainerDelegate
  -(void)webContainerFinished;
@end


@interface WebContainerPlugin : CDVPlugin<WebContainerDelegate>
{
  @private NSString* webContainerFinishedCallBack;
}

@property (nonatomic, retain) WebContainerController* webContainerController;
    - (void)subscribeCallback:(CDVInvokedUrlCommand*)command;
    - (void)addPortfolio:(CDVInvokedUrlCommand*)command;
    - (void)removePortfolio:(CDVInvokedUrlCommand*)command;
    - (void)showPortfolio:(CDVInvokedUrlCommand*)command;
    - (void)hidePortfolio:(CDVInvokedUrlCommand*)command;
    - (void)addInstrumentCard:(CDVInvokedUrlCommand*)command;
    - (void)removeInstrumentCard:(CDVInvokedUrlCommand*)command;
    - (void)showInstrumentCard:(CDVInvokedUrlCommand*)command;
    - (void)hideInstrumentCard:(CDVInvokedUrlCommand*)command;
    - (void)add:(CDVInvokedUrlCommand*)command;
    - (void)add2:(CDVInvokedUrlCommand*)command;
    - (void)remove:(CDVInvokedUrlCommand*)command;
    - (void)show:(CDVInvokedUrlCommand*)command;
    - (void)hide:(CDVInvokedUrlCommand*)command;
    - (void)test:(CDVInvokedUrlCommand*)command;
    - (void)webContainerFinished;
@end


@interface WebContainerController : CDVViewController{}
  @property (nonatomic, assign) id  delegate;
  - (void)viewDidDisappear:(BOOL)animated;
@end
