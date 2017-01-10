import expect from "expect.js";
import sinon from "sinon";
import CameraService from "../../js/services/camera_service.js";

describe("CameraService", () => {
  let mockCamera;
  let cameraService;

  beforeEach(() => {
    mockCamera = {
      getPicture: () => {
      },
      PictureSourceType: {
        CAMERA: 1
      },
      DestinationType: {
        FILE_URI: 2
      },
      MediaType: {
        PICTURE: 3
      }
    };
    sinon.stub(mockCamera, "getPicture", (success, failure, options) => {
      success("test_file_uri");
    });
    cameraService = new CameraService(mockCamera);
  });

  afterEach(() => {
    mockCamera.getPicture.restore();
  });

  describe("getImageUri", () => {
    it("returns an image uri", async() => {
      expect(await cameraService.getImageUri()).to.equal("test_file_uri");
    });
  });
});
