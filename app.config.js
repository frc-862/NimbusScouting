export default {
  "expo": {
    "name": "nimbus",
    "slug": "nimbus",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": false,
          "NSExceptionDomains": {
            "localhost": {
              "NSExceptionAllowsInsecureHTTPLoads": true
            },
            "23.28.96.143": {
              "NSIncludesSubdomains": true,
              "NSExceptionAllowsInsecureHTTPLoads": true
            },
            "frc862.com": {
              "NSIncludesSubdomains": true,
              "NSExceptionAllowsInsecureHTTPLoads": true
            }
          }
        }
      },
      "supportsTablet": true,
      "bundleIdentifier": "com.lightningrobotics.nimbus",
      "buildNumber": "17"
    },
    "android": {
      "usesCleartextTraffic": true,
      "useNextNotificationsApi": true,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.lightningrobotics.nimbus",
      "versionCode": 16
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "API_KEY": process.env.API_KEY,
      "eas": {
        "projectId": "dafc0d24-b2e5-43c4-9da8-6ee1ca58f7bb"
      }
    },
    "owner": "jeeves51243",
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          },
          "ios": {}
        }
      ]
    ]
  }
}
