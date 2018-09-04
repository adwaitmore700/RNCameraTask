import React, { Component } from "react";
import {
  View,
  Image,
  Modal,
  Dimensions,
  Animated,
  StyleSheet
} from "react-native";
import Video from "react-native-video";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("screen");

export default class MediaViewer extends Component {
  constructor(props) {
    super(props);
    this.mediaFile = this.props.navigation.getParam("mediaFile", null);
    this.fileType = this.props.navigation.getParam("fileType", null);
    this.state = {
      videoOpacity: new Animated.Value(1),
      showReplayButton: false,
      isVideoPaused: false
    };
  }

  render() {
    return (
      <View style={styles.pageContainer}>
        {this.fileType == "IMG" ? (
          <Image
            source={{ uri: "file://" + this.mediaFile.path }}
            style={styles.mediaImage}
          />
        ) : (
          <View style={styles.mediaVideoContainer}>
            <Animated.View style={styles.mediaVideo}>
              <Video
                source={{ uri: this.mediaFile.path }}
                ref={ref => {
                  this.player = ref;
                }}
                paused={this.state.isVideoPaused}
                onEnd={() => {
                  this.setState({
                    showReplayButton: true
                  });
                }}
                style={styles.mediaVideo}
              />
            </Animated.View>
            <Modal
              transparent={true}
              animationType={"none"}
              visible={this.state.showReplayButton}
              onRequestClose={() => {
                this.setState({ showReplayButton: false }, () => {
                  this.props.navigation.pop();
                });
              }}
            >
              <View style={styles.videoOverlay}>
                <Icon
                  name="replay"
                  size={45}
                  color="#f3f3f3"
                  style={styles.replayButton}
                  onPress={() => {
                    this.player.seek(0);
                    this.setState({
                      isVideoPaused: false,
                      showReplayButton: false
                    });
                  }}
                />
              </View>
            </Modal>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: "#00000099" },
  mediaImage: { width: width, height: height, resizeMode: "center" },
  mediaVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  mediaVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  videoOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000099"
  },
  replayButton: {
    alignSelf: "center",
    position: "absolute",
    zIndex: 100
  }
});
