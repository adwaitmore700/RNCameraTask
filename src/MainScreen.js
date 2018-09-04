import React, { Component } from "react";
import {
  View,
  StatusBar,
  PermissionsAndroid,
  ActivityIndicator
} from "react-native";
import { createStackNavigator } from "react-navigation";
import CameraScreen from "./CameraScreen";
import GalleryScreen from "./GalleryScreen";
import MediaViewer from "./MediaViewer";
import RNFetchBlob from "react-native-fetch-blob";

const APP_STORAGE_PATH = RNFetchBlob.fs.dirs.PictureDir + "/RNCamera";

export default class MainScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false
    };
  }

  componentDidMount() {
    this.requestPermission().then(permissionStatus => {
      if (permissionStatus) {
        this.createDirectoryForAppFiles();
      }
    });
  }

  render() {
    if (!this.state.isReady) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator loading={true} size={"large"} color={"#000"} />
        </View>
      );
    } else {
      const AppNavigator = createStackNavigator(
        {
          // For each screen that you can navigate to, create a new entry like this:
          Camera: {
            screen: CameraScreen
          },
          Gallery: {
            screen: GalleryScreen
          },
          MediaViewer: {
            screen: MediaViewer
          }
        },
        {
          initialRouteName: "Camera",
          headerMode: "none",
          header: null,
          mode: "modal"
        }
      );
      return (
        <View style={{ flex: 1 }}>
          <StatusBar hidden={true} />
          <AppNavigator />
        </View>
      );
    }
  }

  createDirectoryForAppFiles = async () => {
    try {
      let folderExists = await RNFetchBlob.fs.isDir(APP_STORAGE_PATH);
      if (!folderExists) {
        await RNFetchBlob.fs.mkdir(APP_STORAGE_PATH);
      }
      this.setState({ isReady: true });
    } catch (exc) {
      console.log(exc);
      this.setState({ isReady: false });
    }
  };

  requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CAMERA
      ]);
      if (
        granted["android.permission.RECORD_AUDIO"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.READ_EXTERNAL_STORAGE"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.WRITE_EXTERNAL_STORAGE"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.CAMERA"] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  };
}
