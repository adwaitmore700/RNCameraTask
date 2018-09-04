import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  Platform,
  Text,
  StyleSheet
} from "react-native";
import { RNCamera } from "react-native-camera";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import RNFetchBlob from "react-native-fetch-blob";

const APP_STORAGE_PATH = RNFetchBlob.fs.dirs.PictureDir + "/RNCamera/";

export default class CameraScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRecording: false,
      buttonColor: "#fff",
      videoRecordingTime: ""
    };
    this.startTimer = moment()
      .hours(0)
      .minutes(0)
      .seconds(0);
  }

  componentWillMount() {
    //checking for free space for video recording, calling it in willmount
    //because there is no state update in queue, variable is a class variable
    this.checkForStorageSpace();
  }

  checkForStorageSpace() {
    RNFetchBlob.fs.df().then(response => {
      this.maxVideoFileSize = Platform.select({
        ios: response.free,
        android: response.internal_free
      });
    });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.cameraStyle}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
        />
        <TouchableOpacity
          onPress={this.takePicture}
          onLongPress={this.startRecording}
          style={[
            styles.captureButton,
            { backgroundColor: this.state.buttonColor }
          ]}
        />
        <Icon
          name="photo"
          size={30}
          style={styles.galleryIcon}
          color="#f3f3f3"
          onPress={e => {
            this.props.navigation.push("Gallery");
            e.preventDefault();
          }}
        />
        <Text style={styles.recordingTime}>
          {this.state.videoRecordingTime}
        </Text>
      </View>
    );
  }

  takePicture = async e => {
    if (this.camera) {
      if (this.state.isRecording) {
        this.setState({
          isRecording: false,
          buttonColor: "#fff",
          videoRecordingTime: ""
        });
        try {
          await this.camera.stopRecording();
        } catch (ex) {
          alert("Error while stopping the recorder, please restart the camera");
        }
        clearInterval(this.timerId);
        this.startTimer = moment()
          .hours(0)
          .minutes(0)
          .seconds(0);
      } else {
        const options = { quality: 1, base64: true, exif: true };
        try {
          const data = await this.camera.takePictureAsync(options);
          await this.saveMediaToStorage(data.uri, false);
        } catch (error) {
          alert("Error while capturing, please restart the camera");
        }
      }
    }
  };

  startRecording = async e => {
    if (this.camera && !this.state.isRecording) {
      this.setState({
        isRecording: true,
        buttonColor: "red"
      });
      const options = {
        quality: 1,
        maxFileSize: parseInt(this.maxVideoFileSize)
      };
      this.timerId = setInterval(this.updateTimer, 1000);
      try {
        const data = await this.camera.recordAsync(options);
        await this.saveMediaToStorage(data.uri, true);
      } catch (error) {
        alert("Error while starting the recorder, please restart the camera");
      }
    }
  };

  updateTimer = () => {
    let newTime = this.startTimer.add(1, "seconds");
    this.setState({
      videoRecordingTime: newTime.format("mm:ss")
    });
  };

  async saveMediaToStorage(uri, isVideo) {
    try {
      let fileDate = new Date();
      let fileName = `${
        isVideo ? "VID" : "IMG"
      }_${fileDate.getFullYear()}_${fileDate.getMonth()}_${fileDate.getDate()}_${fileDate.getHours()}_${fileDate.getMinutes()}_${fileDate.getSeconds()}.${
        isVideo ? "mp4" : "jpg"
      }`;
      await RNFetchBlob.fs.cp(uri, APP_STORAGE_PATH + fileName);
      await RNFetchBlob.fs.unlink(uri);
      this.checkForStorageSpace();
    } catch (error) {
      alert(`Error while saving the ${isVideo ? "recorded video" : "image"}`);
    }
  }
}

const styles = StyleSheet.create({
  cameraStyle: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  captureButton: {
    position: "absolute",
    bottom: 25,
    height: 50,
    width: 50,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: "grey",
    alignSelf: "center"
  },
  galleryIcon: { position: "absolute", bottom: 25, right: 25 },
  recordingTime: {
    position: "absolute",
    bottom: 25,
    left: 25,
    color: "red",
    fontSize: 20,
    fontWeight: "400"
  }
});
