"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = __importDefault(require("events"));
var mute_stream_1 = __importDefault(require("mute-stream"));
var rxjs_1 = require("rxjs");
var ansi_escapes_1 = __importDefault(require("ansi-escapes"));
var readline_1 = __importDefault(require("readline"));
var options = {
    type: 'list',
    name: 'name',
    message: 'select your name',
    choices: [
        {
            name: 'a',
            value: 1,
        },
        {
            name: 'b',
            value: 2,
        },
        {
            name: 'c',
            value: 3,
        },
    ]
};
function Prompt(option) {
    return new Promise(function (resolve, reject) {
        try {
            var list = new List(option);
            list.render();
            list.on("exit", function (answer) {
                console.log(answer);
                resolve(answer);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
var List = /** @class */ (function (_super) {
    __extends(List, _super);
    function List(option) {
        var _this = _super.call(this) || this;
        _this.onKeyPress = function (e) {
            var key = e[1];
            switch (key.name) {
                case "down":
                    _this.selected++;
                    break;
                case "up":
                    _this.selected--;
                    break;
                case "return":
                    _this.hasSelected = true;
                    _this.render();
                    _this.close();
                    _this.emit("exit", _this.choices[_this.selected]);
                    return;
                default:
                    break;
            }
            if (_this.selected > _this.choices.length - 1) {
                _this.selected = 0;
            }
            if (_this.selected < 0) {
                _this.selected = _this.choices.length - 1;
            }
            _this.render();
        };
        _this.name = option.name;
        _this.message = option.message;
        _this.choices = option.choices;
        _this.input = process.stdin;
        var ms = new mute_stream_1.default();
        ms.pipe(process.stdout);
        _this.output = ms;
        _this.rl = readline_1.default.createInterface({
            input: _this.input,
            output: _this.output,
        });
        _this.selected = 0;
        _this.keypress = (0, rxjs_1.fromEvent)(_this.rl.input, "keypress")
            .forEach(_this.onKeyPress);
        _this.hasSelected = false;
        return _this;
    }
    List.prototype.close = function () {
    };
    List.prototype.getContent = function () {
        var _this = this;
        var title = this.message + '(Use arrow keys)\n';
        if (!this.hasSelected) {
            this.choices.forEach(function (choice, index) {
                if (index === _this.selected) {
                    if (index === _this.selected.length - 1) {
                        title += '> ' + choice.name;
                    }
                    else {
                        title += '> ' + choice.name + '\n';
                    }
                }
                else {
                    if (index === _this.selected.length - 1) {
                        title += '  ' + choice.name;
                    }
                    else {
                        title += '  ' + choice.name + '\n';
                    }
                }
            });
        }
        else {
        }
        return title;
    };
    List.prototype.clean = function () {
        var emptyLines = ansi_escapes_1.default.eraseLines(this.choices.length + 1);
        this.output.write(emptyLines);
    };
    List.prototype.render = function () {
        this.output.unmute();
        this.clean();
        this.output.write(this.getContent());
        this.output.mute();
    };
    return List;
}(events_1.default));
Prompt(options).then(function (res) {
    console.log(res);
});
