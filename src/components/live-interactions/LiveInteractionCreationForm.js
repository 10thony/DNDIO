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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveInteractionCreationForm = void 0;
var react_1 = require("react");
var react_2 = require("convex/react");
var react_router_dom_1 = require("react-router-dom");
var clerk_react_1 = require("@clerk/clerk-react");
var api_1 = require("../../../convex/_generated/api");
var button_1 = require("../ui/button");
var input_1 = require("../ui/input");
var label_1 = require("../ui/label");
var textarea_1 = require("../ui/textarea");
var card_1 = require("../ui/card");
var badge_1 = require("../ui/badge");
var tabs_1 = require("../ui/tabs");
var checkbox_1 = require("../ui/checkbox");
var select_1 = require("../ui/select");
var lucide_react_1 = require("lucide-react");
var LiveInteractionCreationForm = function (_a) {
    var campaignId = _a.campaignId, onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var user = (0, clerk_react_1.useUser)().user;
    // Form state
    var _b = (0, react_1.useState)({
        name: '',
        description: '',
        relatedLocationId: '',
        relatedQuestId: '',
    }), formData = _b[0], setFormData = _b[1];
    // Participant selection
    var _c = (0, react_1.useState)([]), selectedPlayerCharacters = _c[0], setSelectedPlayerCharacters = _c[1];
    var _d = (0, react_1.useState)([]), selectedNPCs = _d[0], setSelectedNPCs = _d[1];
    var _e = (0, react_1.useState)([]), selectedMonsters = _e[0], setSelectedMonsters = _e[1];
    // Reward configuration
    var _f = (0, react_1.useState)([]), rewardItems = _f[0], setRewardItems = _f[1];
    var _g = (0, react_1.useState)([]), xpAwards = _g[0], setXpAwards = _g[1];
    // Queries
    var campaign = (0, react_2.useQuery)(api_1.api.campaigns.getCampaignById, {
        id: campaignId,
        clerkId: (user === null || user === void 0 ? void 0 : user.id) || ''
    });
    var playerCharacters = (0, react_2.useQuery)(api_1.api.characters.getAllCharacters);
    var npcs = (0, react_2.useQuery)(api_1.api.npcs.getAllNpcs);
    var monsters = (0, react_2.useQuery)(api_1.api.monsters.getAllMonsters);
    var locations = (0, react_2.useQuery)(api_1.api.locations.list);
    var quests = (0, react_2.useQuery)(api_1.api.quests.getAllQuests);
    var items = (0, react_2.useQuery)(api_1.api.items.getItems);
    // Mutations
    var createInteraction = (0, react_2.useMutation)(api_1.api.interactions.createInteraction);
    // Filter participants to campaign-specific ones
    var campaignPlayerCharacters = (playerCharacters === null || playerCharacters === void 0 ? void 0 : playerCharacters.filter(function (char) { var _a; return (_a = campaign === null || campaign === void 0 ? void 0 : campaign.participantPlayerCharacterIds) === null || _a === void 0 ? void 0 : _a.includes(char._id); })) || [];
    var campaignNPCs = (npcs === null || npcs === void 0 ? void 0 : npcs.filter(function (npc) { var _a; return (_a = campaign === null || campaign === void 0 ? void 0 : campaign.npcIds) === null || _a === void 0 ? void 0 : _a.includes(npc._id); })) || [];
    var campaignMonsters = (monsters === null || monsters === void 0 ? void 0 : monsters.filter(function (monster) { var _a; return (_a = campaign === null || campaign === void 0 ? void 0 : campaign.monsterIds) === null || _a === void 0 ? void 0 : _a.includes(monster._id); })) || [];
    var campaignLocations = (locations === null || locations === void 0 ? void 0 : locations.filter(function (location) { var _a; return (_a = campaign === null || campaign === void 0 ? void 0 : campaign.locationIds) === null || _a === void 0 ? void 0 : _a.includes(location._id); })) || [];
    var campaignQuests = (quests === null || quests === void 0 ? void 0 : quests.filter(function (quest) { var _a; return (_a = campaign === null || campaign === void 0 ? void 0 : campaign.questIds) === null || _a === void 0 ? void 0 : _a.includes(quest._id); })) || [];
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var interactionId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!(user === null || user === void 0 ? void 0 : user.id)) {
                        alert('You must be logged in to create an interaction.');
                        return [2 /*return*/];
                    }
                    if (!formData.name.trim()) {
                        alert('Please enter an interaction name.');
                        return [2 /*return*/];
                    }
                    if (selectedPlayerCharacters.length === 0 && selectedNPCs.length === 0 && selectedMonsters.length === 0) {
                        alert('Please select at least one participant.');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, createInteraction({
                            name: formData.name,
                            description: formData.description || undefined,
                            clerkId: user.id,
                            campaignId: campaignId,
                            relatedQuestId: formData.relatedQuestId || undefined,
                            playerCharacterIds: selectedPlayerCharacters,
                            npcIds: selectedNPCs,
                            monsterIds: selectedMonsters,
                            // rewardItemIds: rewardItems,
                            // xpAwards: xpAwards,
                        })];
                case 2:
                    interactionId = _a.sent();
                    console.log('Live interaction created:', interactionId);
                    if (onSuccess) {
                        onSuccess();
                    }
                    else {
                        navigate("/campaigns/".concat(campaignId, "/live-interaction"));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error creating live interaction:', error_1);
                    alert('Failed to create live interaction. Please try again.');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handlePlayerCharacterToggle = function (characterId) {
        setSelectedPlayerCharacters(function (prev) {
            return prev.includes(characterId)
                ? prev.filter(function (id) { return id !== characterId; })
                : __spreadArray(__spreadArray([], prev, true), [characterId], false);
        });
    };
    var handleNPCToggle = function (npcId) {
        setSelectedNPCs(function (prev) {
            return prev.includes(npcId)
                ? prev.filter(function (id) { return id !== npcId; })
                : __spreadArray(__spreadArray([], prev, true), [npcId], false);
        });
    };
    var handleMonsterToggle = function (monsterId) {
        setSelectedMonsters(function (prev) {
            return prev.includes(monsterId)
                ? prev.filter(function (id) { return id !== monsterId; })
                : __spreadArray(__spreadArray([], prev, true), [monsterId], false);
        });
    };
    var handleRewardItemToggle = function (itemId) {
        setRewardItems(function (prev) {
            return prev.includes(itemId)
                ? prev.filter(function (id) { return id !== itemId; })
                : __spreadArray(__spreadArray([], prev, true), [itemId], false);
        });
    };
    var handleXpAwardChange = function (characterId, xp) {
        setXpAwards(function (prev) {
            var existing = prev.find(function (award) { return award.playerCharacterId === characterId; });
            if (existing) {
                return prev.map(function (award) {
                    return award.playerCharacterId === characterId
                        ? __assign(__assign({}, award), { xp: xp }) : award;
                });
            }
            else {
                return __spreadArray(__spreadArray([], prev, true), [{ playerCharacterId: characterId, xp: xp }], false);
            }
        });
    };
    var handleCancel = function () {
        if (onCancel) {
            onCancel();
        }
        else {
            navigate("/campaigns/".concat(campaignId));
        }
    };
    if (!campaign || !playerCharacters || !npcs || !monsters || !locations || !quests || !items) {
        return (<div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>);
    }
    return (<div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button_1.Button variant="ghost" size="sm" onClick={handleCancel}>
            <lucide_react_1.ArrowLeft className="h-4 w-4 mr-2"/>
            Back to Campaign
          </button_1.Button>
          <div>
            <h1 className="text-3xl font-bold">Create Live Interaction</h1>
            <p className="text-muted-foreground">
              Set up a new turn-based interaction for your campaign
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <tabs_1.Tabs defaultValue="basic" className="w-full">
          <tabs_1.TabsList className="grid w-full grid-cols-4">
            <tabs_1.TabsTrigger value="basic" className="flex items-center gap-2">
              <lucide_react_1.Target className="h-4 w-4"/>
              Basic Info
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="participants" className="flex items-center gap-2">
              <lucide_react_1.Users className="h-4 w-4"/>
              Participants
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="context" className="flex items-center gap-2">
              <lucide_react_1.MapPin className="h-4 w-4"/>
              Context
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="rewards" className="flex items-center gap-2">
              <lucide_react_1.Gift className="h-4 w-4"/>
              Rewards
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          {/* Basic Information Tab */}
          <tabs_1.TabsContent value="basic" className="space-y-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Basic Information</card_1.CardTitle>
                <card_1.CardDescription>
                  Core details about the live interaction
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="name">Interaction Name *</label_1.Label>
                  <input_1.Input id="name" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} placeholder="Enter interaction name" required/>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="description">Description</label_1.Label>
                  <textarea_1.Textarea id="description" value={formData.description} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }} placeholder="Describe the interaction..." rows={4}/>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Participants Tab */}
          <tabs_1.TabsContent value="participants" className="space-y-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Users className="h-5 w-5"/>
                  Player Characters
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Select player characters participating in this interaction
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {campaignPlayerCharacters.map(function (character) { return (<div key={character._id} className="flex items-center space-x-2">
                      <checkbox_1.Checkbox id={"character-".concat(character._id)} checked={selectedPlayerCharacters.includes(character._id)} onCheckedChange={function () { return handlePlayerCharacterToggle(character._id); }}/>
                      <label_1.Label htmlFor={"character-".concat(character._id)} className="text-sm font-normal cursor-pointer">
                        {character.name}
                        <badge_1.Badge variant="outline" className="ml-2 text-xs">
                          Level {character.level}
                        </badge_1.Badge>
                      </label_1.Label>
                    </div>); })}
                </div>
                {campaignPlayerCharacters.length === 0 && (<div className="text-center py-8">
                    <lucide_react_1.Users className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                    <p className="text-muted-foreground">No player characters available for this campaign</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Crown className="h-5 w-5"/>
                  NPCs
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Select NPCs involved in this interaction
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {campaignNPCs.map(function (npc) { return (<div key={npc._id} className="flex items-center space-x-2">
                      <checkbox_1.Checkbox id={"npc-".concat(npc._id)} checked={selectedNPCs.includes(npc._id)} onCheckedChange={function () { return handleNPCToggle(npc._id); }}/>
                      <label_1.Label htmlFor={"npc-".concat(npc._id)} className="text-sm font-normal cursor-pointer">
                        {npc.name}
                        <badge_1.Badge variant="outline" className="ml-2 text-xs">
                          Level {npc.level}
                        </badge_1.Badge>
                      </label_1.Label>
                    </div>); })}
                </div>
                {campaignNPCs.length === 0 && (<div className="text-center py-8">
                    <lucide_react_1.Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                    <p className="text-muted-foreground">No NPCs available for this campaign</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Sword className="h-5 w-5"/>
                  Monsters
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Select monsters involved in this interaction
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {campaignMonsters.map(function (monster) { return (<div key={monster._id} className="flex items-center space-x-2">
                      <checkbox_1.Checkbox id={"monster-".concat(monster._id)} checked={selectedMonsters.includes(monster._id)} onCheckedChange={function () { return handleMonsterToggle(monster._id); }}/>
                      <label_1.Label htmlFor={"monster-".concat(monster._id)} className="text-sm font-normal cursor-pointer">
                        {monster.name}
                        <badge_1.Badge variant="outline" className="ml-2 text-xs">
                          CR {monster.challengeRating}
                        </badge_1.Badge>
                      </label_1.Label>
                    </div>); })}
                </div>
                {campaignMonsters.length === 0 && (<div className="text-center py-8">
                    <lucide_react_1.Sword className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                    <p className="text-muted-foreground">No monsters available for this campaign</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Context Tab */}
          <tabs_1.TabsContent value="context" className="space-y-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.MapPin className="h-5 w-5"/>
                  Location & Quest Context
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Associate this interaction with a location or quest
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="relatedLocationId">Related Location</label_1.Label>
                  <select_1.Select value={formData.relatedLocationId || "none"} onValueChange={function (value) { return setFormData(__assign(__assign({}, formData), { relatedLocationId: value === "none" ? undefined : value })); }}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Select a location (optional)"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="none">No location</select_1.SelectItem>
                      {campaignLocations.map(function (location) { return (<select_1.SelectItem key={location._id} value={location._id}>
                          {location.name}
                        </select_1.SelectItem>); })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="relatedQuestId">Related Quest</label_1.Label>
                  <select_1.Select value={formData.relatedQuestId || "none"} onValueChange={function (value) { return setFormData(__assign(__assign({}, formData), { relatedQuestId: value === "none" ? undefined : value })); }}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Select a quest (optional)"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="none">No quest</select_1.SelectItem>
                      {campaignQuests.map(function (quest) { return (<select_1.SelectItem key={quest._id} value={quest._id}>
                          {quest.name}
                        </select_1.SelectItem>); })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Rewards Tab */}
          <tabs_1.TabsContent value="rewards" className="space-y-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Package className="h-5 w-5"/>
                  Reward Items
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Select items that will be rewarded upon completion
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(function (item) { return (<div key={item._id} className="flex items-center space-x-2">
                      <checkbox_1.Checkbox id={"reward-item-".concat(item._id)} checked={rewardItems.includes(item._id)} onCheckedChange={function () { return handleRewardItemToggle(item._id); }}/>
                      <label_1.Label htmlFor={"reward-item-".concat(item._id)} className="text-sm font-normal cursor-pointer">
                        {item.name}
                        {item.rarity && (<badge_1.Badge variant="outline" className="ml-2 text-xs">
                            {item.rarity}
                          </badge_1.Badge>)}
                      </label_1.Label>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Gift className="h-5 w-5"/>
                  Experience Points
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Award experience points to participating characters
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {campaignPlayerCharacters.map(function (character) {
            var _a;
            return (<div key={character._id} className="flex items-center space-x-4">
                      <label_1.Label className="min-w-[120px]">{character.name}</label_1.Label>
                      <input_1.Input type="number" placeholder="0" min="0" className="w-24" value={((_a = xpAwards.find(function (a) { return a.playerCharacterId === character._id; })) === null || _a === void 0 ? void 0 : _a.xp) || ''} onChange={function (e) { return handleXpAwardChange(character._id, parseInt(e.target.value) || 0); }}/>
                      <span className="text-sm text-muted-foreground">XP</span>
                    </div>);
        })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button_1.Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </button_1.Button>
          <button_1.Button type="submit">
            Create Live Interaction
          </button_1.Button>
        </div>
      </form>
    </div>);
};
exports.LiveInteractionCreationForm = LiveInteractionCreationForm;
