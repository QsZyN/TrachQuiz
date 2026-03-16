(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/nfcpass/lib/usb.js
  var require_usb = __commonJS({
    "node_modules/nfcpass/lib/usb.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ACK = [0, 0, 255, 0, 255, 0];
    }
  });

  // node_modules/nfcpass/lib/utils.js
  var require_utils = __commonJS({
    "node_modules/nfcpass/lib/utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function arrayToHexString(arr) {
        let result = "";
        for (let i = 0; i < arr.length; i++) {
          const val = arr[i];
          if (val < 16) {
            result += "0";
          }
          result += val.toString(16);
        }
        return result.toUpperCase();
      }
      exports.arrayToHexString = arrayToHexString;
    }
  });

  // node_modules/nfcpass/lib/index.js
  var require_lib = __commonJS({
    "node_modules/nfcpass/lib/index.js"(exports) {
      "use strict";
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : new P(function(resolve2) {
              resolve2(result.value);
            }).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var usb_1 = require_usb();
      var utils_1 = require_utils();
      var CardInfo = class {
        constructor(spec, idm, pmm) {
          this.spec = spec;
          this.idm = idm;
          this.pmm = pmm;
        }
      };
      exports.CardInfo = CardInfo;
      var NFCDevice = class {
        constructor(device) {
          this.device = device;
        }
        receive(len) {
          return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.device.transferIn(1, len);
            console.debug(data);
            let arr = [];
            for (let i = data.data.byteOffset; i < data.data.byteLength; i++) {
              arr.push(data.data.getUint8(i));
            }
            console.debug(arr);
            return arr;
          });
        }
        send(data) {
          return __awaiter(this, void 0, void 0, function* () {
            let uint8a = new Uint8Array(data);
            console.debug(uint8a);
            yield this.device.transferOut(2, uint8a);
          });
        }
        sendCommand(cmd, params) {
          return __awaiter(this, void 0, void 0, function* () {
            let command = [0, 0, 255, 255, 255];
            let data = [214, cmd].concat(params);
            command = command.concat([data.length, 0, 256 - data.length]);
            command = command.concat(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
              sum += data[i];
            }
            let parity = (256 - sum) % 256 + 256;
            command = command.concat([parity, 0]);
            yield this.send(command);
            yield this.receive(6);
            const result = yield this.receive(40);
            return result;
          });
        }
        getType2TagInfo() {
          return __awaiter(this, void 0, void 0, function* () {
            console.debug("SwitchRF");
            yield this.sendCommand(6, [0]);
            console.debug("InSetRF");
            yield this.sendCommand(0, [2, 3, 15, 3]);
            console.debug("InSetProtocol");
            yield this.sendCommand(2, [0, 24, 1, 1, 2, 1, 3, 0, 4, 0, 5, 0, 6, 0, 7, 8, 8, 0, 9, 0, 10, 0, 11, 0, 12, 0, 14, 4, 15, 0, 16, 0, 17, 0, 18, 0, 19, 6]);
            yield this.sendCommand(2, [1, 0, 2, 0, 5, 1, 0, 6, 7, 7]);
            console.debug("InCommRF:SENS");
            yield this.sendCommand(4, [54, 1, 38]);
            console.debug("InCommRF:SDD");
            yield this.sendCommand(2, [4, 1, 7, 8]);
            yield this.sendCommand(2, [1, 0, 2, 0]);
            const ssdRes = yield this.sendCommand(4, [54, 1, 147, 32]);
            const result = utils_1.arrayToHexString(ssdRes.slice(15, 19));
            return result === "00" ? null : new CardInfo("Type4", result, null);
          });
        }
        getType3TagInfo() {
          return __awaiter(this, void 0, void 0, function* () {
            yield this.sendCommand(42, [1]);
            console.debug("SwitchRF");
            yield this.sendCommand(6, [0]);
            console.debug("InSetRF");
            yield this.sendCommand(0, [1, 1, 15, 1]);
            console.debug("InSetProtocol");
            yield this.sendCommand(2, [0, 24, 1, 1, 2, 1, 3, 0, 4, 0, 5, 0, 6, 0, 7, 8, 8, 0, 9, 0, 10, 0, 11, 0, 12, 0, 14, 4, 15, 0, 16, 0, 17, 0, 18, 0, 19, 6]);
            yield this.sendCommand(2, [0, 24]);
            console.debug("InCommRF:SENS");
            const data = yield this.sendCommand(4, [110, 0, 6, 0, 255, 255, 1, 0]);
            return new CardInfo("Type3", utils_1.arrayToHexString(data.slice(17, 25)), utils_1.arrayToHexString(data.slice(25, 33)));
          });
        }
        readCardInfo() {
          return __awaiter(this, void 0, void 0, function* () {
            yield this.send(usb_1.ACK);
            console.debug("GetProperty");
            yield this.sendCommand(42, [1]);
            const type2 = yield this.getType2TagInfo();
            if (type2 != null) {
              return type2;
            }
            const type3 = yield this.getType3TagInfo();
            if (type3 != null) {
              return type3;
            }
            return null;
          });
        }
        readIDm() {
          return __awaiter(this, void 0, void 0, function* () {
            const card = yield this.readCardInfo();
            if (card != null && card.idm != null) {
              return card.idm;
            }
            return "";
          });
        }
      };
      exports.NFCDevice = NFCDevice;
      var DeviceLoader = class {
        static connectDevice() {
          return __awaiter(this, void 0, void 0, function* () {
            const filter = {
              vendorId: 1356
            };
            try {
              const conf = {
                filters: [filter]
              };
              const device = yield navigator.usb.requestDevice(conf);
              yield device.open();
              yield device.selectConfiguration(1);
              yield device.claimInterface(0);
              return new NFCDevice(device);
            } catch (e) {
              throw e;
            }
          });
        }
      };
      exports.DeviceLoader = DeviceLoader;
    }
  });

  // tools/nfcpass-entry.js
  var require_nfcpass_entry = __commonJS({
    "tools/nfcpass-entry.js"() {
      var { DeviceLoader } = require_lib();
      window.NfcpassDeviceLoader = DeviceLoader;
    }
  });
  require_nfcpass_entry();
})();
