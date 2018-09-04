import React, { Component } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from "react-native";
import RNFetchBlob from "react-native-fetch-blob";

const { width, height } = Dimensions.get("screen");
const APP_STORAGE_PATH = RNFetchBlob.fs.dirs.PictureDir + "/RNCamera";

export default class GalleryScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storedMediaArray: [],
      isFetching: true
    };
    this.onImagePress = this.onImagePress.bind(this);
  }

  componentDidMount() {
    RNFetchBlob.fs
      .lstat(APP_STORAGE_PATH)
      .then(stats => {
        this.setState({ storedMediaArray: stats, isFetching: false });
      })
      .catch(err => {
        this.setState({ isFetching: false });
      });
  }

  render() {
    if (this.state.isFetching) {
      return (
        <View style={styles.indicatorContainer}>
          <ActivityIndicator loading={true} size={"large"} color={"#000"} />
        </View>
      );
    } else if (this.state.storedMediaArray.length < 1) {
      return (
        <View
          style={[
            styles.pageContainer,
            { justifyContent: "center", alignItems: "center" }
          ]}
        >
          <Text numberOfLines={2} style={styles.emptyStateText}>
            No Media Files found
          </Text>
        </View>
      );
    } else {
      return (
        <ScrollView
          scrollEnabled={true}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{
            minHeight: height,
            padding: 10,
            backgroundColor: "grey"
          }}
        >
          <View style={styles.pageContainer}>
            {this.state.storedMediaArray.map((item, index) => {
              return (
                <TouchableOpacity
                  key={`${index}`}
                  onPress={() => {
                    this.onImagePress(item);
                  }}
                  style={styles.itemContainer}
                >
                  <Image
                    source={{ uri: "file://" + item.path }}
                    style={styles.galleryMedia}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      );
    }
  }

  onImagePress(mediaFile) {
    let fileType = mediaFile.filename.slice(0, 3);
    this.props.navigation.push("MediaViewer", {
      mediaFile: mediaFile,
      fileType: fileType
    });
  }
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "grey"
  },
  emptyStateText: {
    fontSize: 24,
    color: "#fff",
    alignSelf: "center",
    fontWeight: "500"
  },
  indicatorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  gridView: {
    paddingTop: 15,
    flex: 1,
    backgroundColor: "grey"
  },
  itemContainer: {
    borderRadius: 5,
    justifyContent: "space-between"
  },
  galleryMedia: {
    height: (width - 20) / 3,
    width: (width - 20) / 3,
    resizeMode: "stretch"
  }
});
