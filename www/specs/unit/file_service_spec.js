import expect from "expect.js";
import sinon from "sinon";
import FileService from "../../js/services/file_service";

class MockFileReader {
  constructor() {
    this.result = null;
  }

  readAsArrayBuffer(file) {
    this.result = "test_result";
    this.onloadend();
  }

  onloadend() {
    throw "Unimplemented";
  }
}

class MockBlob {
  constructor(data, type) {
    this.data = data;
    this.type = type;
  }
}

describe("FileService", () => {
  const mockEntry = {
    file: () => {
    }
  };
  const mockFileObject = Symbol("File");
  let fileService;
  let mockWindow;
  let mockFileReader;

  beforeEach(() => {
    sinon.stub(mockEntry, "file", (callback) => {
      callback(mockFileObject);
    });

    mockWindow = {
      resolveLocalFileSystemURL: () => {
      }
    };
    sinon.stub(mockWindow, "resolveLocalFileSystemURL", (uri, success, failure) => {
      success(mockEntry);
    });

    fileService = new FileService(mockWindow, MockFileReader, MockBlob);
  });

  afterEach(() => {
    mockEntry.file.restore();
    mockWindow.resolveLocalFileSystemURL.restore();
  });

  describe("getFile", () => {
    it("resolves with the given uri", async() => {
      await fileService.getFile("test_uri");
      expect(mockWindow.resolveLocalFileSystemURL.calledWith("test_uri")).to.be(true);
    });

    it("returns a FileEntry object for the given uri", async() => {
      expect(await fileService.getFile("test_uri")).to.equal(mockEntry);
    });
  });

  describe("copyFile", () => {
    it("returns a new file uri for the copied file", async() => {
      const mockFileEntry = {
        copyTo: () => {
        }
      };
      sinon.stub(mockFileEntry, "copyTo", (parent, name, success, failure) => {
        success({
          toURL: () => {
            return "new_file_uri";
          }
        });
      });
      expect(await fileService.copyFile(mockFileEntry, "destination_uri")).to.equal("new_file_uri");
      expect(mockWindow.resolveLocalFileSystemURL.calledWith("destination_uri")).to.be(true);
      expect(mockFileEntry.copyTo.calledWith(mockEntry, sinon.match.string, sinon.match.any, sinon.match.any)).to.be(true);
    });
  });

  describe("getBlob", () => {
    it("returns a blob object containing the data stored at the given uri", async() => {
      const blob = await fileService.getBlob("test_uri");
      expect(blob.data).to.eql(["test_result"]);
      expect(blob.type).to.eql({type: "image/jpg"});
    });
  });
});