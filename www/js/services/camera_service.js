import Q from "Q";

export default class CameraService {
  constructor(camera) {
    this.camera = camera;
  }

  getImageUri() {
    let defer = Q.defer();
    this.camera.getPicture(
      (imageUri) => {
        defer.resolve(imageUri);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }
}
