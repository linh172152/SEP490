'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RoomsPage;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var roomService_1 = require("@/services/api/roomService");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
function RoomsPage() {
    var _this = this;
    var _a = (0, react_1.useState)([]), rooms = _a[0], setRooms = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), isCreateDialogOpen = _c[0], setIsCreateDialogOpen = _c[1];
    var _d = (0, react_1.useState)({
        roomName: '',
        description: '',
        capacity: 5,
        floor: '1'
    }), newRoom = _d[0], setNewRoom = _d[1];
    (0, react_1.useEffect)(function () {
        loadRooms();
    }, []);
    var loadRooms = function () { return __awaiter(_this, void 0, void 0, function () {
        var data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, roomService_1.roomService.getAll()];
                case 1:
                    data = _a.sent();
                    setRooms(data);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to load rooms:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCreateRoom = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, roomService_1.roomService.create(newRoom)];
                case 1:
                    _a.sent();
                    setIsCreateDialogOpen(false);
                    setNewRoom({ roomName: '', description: '', capacity: 5, floor: '1' });
                    loadRooms();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to create room:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return <div className="p-6">Loading rooms...</div>;
    }
    return (<div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <dialog_1.Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button>
              <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
              Create Room
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent>
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Create New Room</dialog_1.DialogTitle>
            </dialog_1.DialogHeader>
            <div className="space-y-4">
              <div>
                <label_1.Label htmlFor="roomName">Room Name</label_1.Label>
                <input_1.Input id="roomName" value={newRoom.roomName} onChange={function (e) { return setNewRoom(__assign(__assign({}, newRoom), { roomName: e.target.value })); }} placeholder="Enter room name"/>
              </div>
              <div>
                <label_1.Label htmlFor="description">Description</label_1.Label>
                <input_1.Input id="description" value={newRoom.description} onChange={function (e) { return setNewRoom(__assign(__assign({}, newRoom), { description: e.target.value })); }} placeholder="Enter room description"/>
              </div>
              <div>
                <label_1.Label htmlFor="capacity">Capacity</label_1.Label>
                <input_1.Input id="capacity" type="number" value={newRoom.capacity} onChange={function (e) { return setNewRoom(__assign(__assign({}, newRoom), { capacity: parseInt(e.target.value) })); }}/>
              </div>
              <div>
                <label_1.Label htmlFor="floor">Floor</label_1.Label>
                <input_1.Input id="floor" value={newRoom.floor} onChange={function (e) { return setNewRoom(__assign(__assign({}, newRoom), { floor: e.target.value })); }} placeholder="Enter floor number"/>
              </div>
              <button_1.Button onClick={handleCreateRoom} className="w-full">
                Create Room
              </button_1.Button>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Rooms</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Elderly</card_1.CardTitle>
            <lucide_react_1.User className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {rooms.reduce(function (sum, room) { var _a, _b, _c; return sum + ((_c = (_b = (_a = room.elderlies) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : room.elderlyCount) !== null && _c !== void 0 ? _c : 0); }, 0)}
            </div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Assigned Caregivers</card_1.CardTitle>
            <lucide_react_1.User className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter(function (room) { var _a, _b; return ((_b = (_a = room.caregivers) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : (room.caregiverId ? 1 : 0)) > 0; }).length}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Rooms</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead>Room Name</table_1.TableHead>
                <table_1.TableHead>Floor</table_1.TableHead>
                <table_1.TableHead>Capacity</table_1.TableHead>
                <table_1.TableHead>Elderly Count</table_1.TableHead>
                <table_1.TableHead>Caregiver</table_1.TableHead>
                <table_1.TableHead>Actions</table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {rooms.map(function (room) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            var roomLabel = (_b = (_a = room.roomName) !== null && _a !== void 0 ? _a : room.name) !== null && _b !== void 0 ? _b : 'Unnamed Room';
            var elderlyCount = (_e = (_d = (_c = room.elderlies) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : room.elderlyCount) !== null && _e !== void 0 ? _e : 0;
            var caregiverLabel = (_h = (_g = (_f = room.caregivers) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : room.caregiverName;
            return (<table_1.TableRow key={room.id}>
                    <table_1.TableCell className="font-medium">{roomLabel}</table_1.TableCell>
                    <table_1.TableCell>{(_j = room.floor) !== null && _j !== void 0 ? _j : 'N/A'}</table_1.TableCell>
                    <table_1.TableCell>{(_k = room.capacity) !== null && _k !== void 0 ? _k : 'N/A'}</table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge variant={elderlyCount > 0 ? "default" : "secondary"}>
                        {elderlyCount} / {(_l = room.capacity) !== null && _l !== void 0 ? _l : 'N/A'}
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {caregiverLabel ? (<badge_1.Badge variant="outline">{caregiverLabel}</badge_1.Badge>) : (<badge_1.Badge variant="secondary">Unassigned</badge_1.Badge>)}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <link_1.default href={"/dashboard/admin/rooms/".concat(room.id)}>
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                          View Details
                        </button_1.Button>
                      </link_1.default>
                    </table_1.TableCell>
                  </table_1.TableRow>);
        })}
            </table_1.TableBody>
          </table_1.Table>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
