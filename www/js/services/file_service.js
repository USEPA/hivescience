import Q from "Q";

export default class FileService {
  constructor(window, fileReaderClass, blobClass) {
    this.window = window;
    this.fileReaderClass = fileReaderClass;
    this.blobClass = blobClass;
  }

  getFile(uri) {
    let defer = Q.defer();
    this.window.resolveLocalFileSystemURL(
      uri,
      (fileEntry) => {
        defer.resolve(fileEntry);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getBlob(uri) {
    let defer = Q.defer();
    this.window.resolveLocalFileSystemURL(
      uri,
      (fileEntry) => {
        fileEntry.file((file) => {
            const reader = new this.fileReaderClass();
            reader.onloadend = () => {
              const blob = new this.blobClass([reader.result], {type: "image/jpg"});
              defer.resolve(blob);
            };
            reader.readAsArrayBuffer(file);
          },
          (error) => {
            defer.reject(error);
          }
        );
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  copyFile(file, destinationUri) {
    let defer = Q.defer();
    this.window.resolveLocalFileSystemURL(
      destinationUri,
      (directoryEntry) => {
        file.copyTo(directoryEntry, `${Date.now()}.jpg`,
          (newFileEntry) => {
            defer.resolve(newFileEntry.toURL());
          },
          (error) => {
            defer.reject(error);
          });
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }
}