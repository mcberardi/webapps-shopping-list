/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

// Singleton classes.
//
ShoppingListApp = {}; // Shopping list application object.
MyListsView = {}; // The My lists view.
MyStoresView = {}; // The My stores view.
MyFavoritesView = {};  // The My favorites view.

AlphabeticallySorter = {}; // List sorter for sorting items alphabetically.
StoreSorter = {}; // List sorter for sorting items by store.
TypeSorter = {}; // List sorter for sorting items by type.
BoughtStatusSorter = {}; // List sorter for sorting items by bought status.

var editListScreen;
var editItemScreen;
var addStoreDialog;
var photoFullScreenView;

var HARDWARE = 1;

(function () {
    "use strict";

    MyListsView = new function() {
        var self = this;

        self.populateListOfLists = function() {
            self.populateListOfListsMain();
        };

        self.populateListOfListsMain = function() {
            self.resetListOfLists = true;
            self.renderListOfListsItem = self.renderListOfListsItemMain;
            self.populateActiveListPane = self.populateActiveListPaneMain;
            self.populateListOfListsNextPhase = self.populateListOfListsViewAll;
            ShoppingListApp.DBManager.selectListData(ShoppingListApp.populateListOfListsCallback);
        };

        self.populateListOfListsViewAll = function() {
            self.resetListOfLists = false;
            self.renderListOfListsItem = self.renderViewAllListOfListsItem;
            self.populateActiveListPane = self.populateViewAllActiveListPane;
            self.populateListOfListsNextPhase = function() {}; // No next phase, we're done.
            ShoppingListApp.DBManager.selectAllItemData(ShoppingListApp.populateListOfListsCallback);
        };

        self.populateActiveListPaneMain = function(item) {
            var retVal =
            {
                innerHTML :
                    "<div class='activelistnarrow " + item.color + "'>" +
                       "<div class='activelistinfopane'>" +
                           "<div class='activelistitemcount'>" + item.boughtcount + "/" + item.totalcount + "</div>" +
                           "<div class='activelistname'>" + item.name + "</div>" +
                       "</div>" +
                       "<div class='activelistbutton'></div>" +
                   "</div>" +
                   "<button id='activelistaddnewlistbutton' class='shoppinglistbutton'></button>",
                handlerMap : {
                    'div.activelistnarrow' : {
                        'click' : function() {
                            ShoppingListApp.onListOfListsRowClicked(escape(item.name));
                        },
                        'mousedown' : function() {
                            ShoppingListApp.onMouseDownOnList(escape(item.name),item.color);
                        },
                        'mouseup' : function() {
                            ShoppingListApp.clearLongPressTimeout();
                        },
                        'mouseout' : function() {
                            ShoppingListApp.clearLongPressTimeout();
                        },
                        'touchstart' : function() {
                            ShoppingListApp.onMouseDownOnList(escape(item.name),item.color);
                        },
                        'touchend' : function() {
                            ShoppingListApp.clearLongPressTimeout();
                        },
                        'touchmove' : function() {
                            ShoppingListApp.clearLongPressTimeout();
                        },
                        'touchcancel' : function() {
                            ShoppingListApp.clearLongPressTimeout();
                        }
                    },
                    'div.activelistbutton' : {
                        'click' : function() {
                            MyListSelectionDialog.showListSelectionDialog(ShoppingListApp.activelistSelectedCallback, true);
                       }
                    },
                    '#activelistaddnewlistbutton' : {
                        'click' : function() {
                            editListScreen.show(VIEW_MODE.NEW);
                        }
                    }
                }
            };

            return retVal;
        };

        self.populateViewAllActiveListPane = function(item) {
            var retVal = {
                innerHTML :
                   "<div class='activelistnarrow green_2'>" +
                       "<div class='activelistinfopane'>" +
                          "<div class='activelistitemcount'>" + item.boughtcount + "/" + item.totalcount + "</div>" +
                          "<div class='activelistname'>" + Localizer.getTranslation("view_all") + "</div>" +
                       "</div>" +
                       "<div class='activelistbutton'></div>" +
                   "</div>" +
                   "<button id='activelistaddnewlistbutton' class='shoppinglistbutton'></button>",
                handlerMap : {
                  'div.activelistnarrow' : {
                    'click': function() {
                      ShoppingListApp.onListOfListsRowClicked(ShoppingListApp.ALL_KEY);
                    }
                  },
                  'div.activelistbutton' : {
                    'click' : function() {
                      MyListSelectionDialog.showListSelectionDialog(ShoppingListApp.activelistSelectedCallback, true);
                    }
                  },
                  '#activelistaddnewlistbutton' : {
                    'click' : function() {
                      editListScreen.show(VIEW_MODE.NEW);
                    }
                  }
                }
            };

            return retVal;
        };

        self.getOptionsPaneParameters = function() {
            return {
                listpane: "addnewlistpane black",
                addNewListButtonVisibility: "visible",
                addNewListText: Localizer.getTranslation("add_new_list"),
                addButtonOnClick: function() { editListScreen.show(VIEW_MODE.NEW); }
            };
        };

        self.getViewSwitcherPaneButtonStates = function() {
            return {
               mylistsbuttonClass: "shoppinglistbutton mylistsbuttonselected",
               mystoresbuttonClass: "shoppinglistbutton mystoresbutton",
               myfavoritesbuttonClass: "shoppinglistbutton myfavoritesbutton"
            };
        };

        self.renderListOfListsItemMain = function(item) {
            var itemcountclass = (ShoppingListApp.currentKey === item.name) ? "listitemcount_selected" : "";
            var itemnameclass = (ShoppingListApp.currentKey === item.name) ? "listitemname_selected" : "";

            var retVal = {
                innerHTML :
                    "<div class='listoflistsrow " + item.color + "'>" +
                       "<div class='listoflistsitemcount " + itemcountclass + "'>" + item.boughtcount + "/" + item.totalcount + "</div>" +
                       "<div class='listoflistsname " + itemnameclass + "'>" + item.name + "</div>" +
                   "</div>",
                handlerMap : {
                  'div.listoflistsrow' : {
                    'click':function() {
                      ShoppingListApp.onListOfListsRowClicked(escape(item.name));
                    },
                    'mousedown touchstart':function() {
                      ShoppingListApp.onMouseDownOnList(escape(item.name),item.color);
                    },
                    'mouseup mouseout touchend touchmove touchcancel':function() {
                      ShoppingListApp.clearLongPressTimeout();
                    }
                  }
                }
            };
            return retVal;
        };

        self.renderViewAllListOfListsItem = function(item) {
            var itemcountclass = (ShoppingListApp.currentKey === ShoppingListApp.ALL_KEY) ? "listitemcount_selected" : "";
            var itemnameclass = (ShoppingListApp.currentKey === ShoppingListApp.ALL_KEY) ? "listitemname_selected" : "";
            var retVal = {
                innerHTML :
                    "<div class='listoflistsrow green_2'" +
                       "<div class='listoflistsitemcount " + itemcountclass + "'>" + item.boughtcount + "/" + item.totalcount + "</div>" +
                       "<div class='listoflistsname " + itemnameclass + "'>" + Localizer.getTranslation("view_all") + "</div>" +
                   "</div>",
                handlerMap: {
                  'div.listoflistsrow' : {
                    'click' : function() {
                      ShoppingListApp.onListOfListsRowClicked(ShoppingListApp.ALL_KEY);
                    }
                  }
                }
            };

            return retVal;
        };

        self.populateCurrentList = function() {
            if (ShoppingListApp.currentKey === ShoppingListApp.ALL_KEY) {
                ShoppingListApp.DBManager.selectAllItems(ShoppingListApp.populateCurrentListCallback, ShoppingListApp.searchPattern.value);
            } else {
                ShoppingListApp.DBManager.selectItemsFromList(ShoppingListApp.currentKey, ShoppingListApp.populateCurrentListCallback, ShoppingListApp.searchPattern.value);
            }
        };

        self.renderCurrentListItem = function(item) {
            var itemboughtclass = (item.bought == 1) ? "itembought" : "itemnotbought";
            var itemisfavoriteclass = (item.favorite == 1) ? "itemisfavorite" : "itemisnotfavorite";
            var retVal = {
              innerHTML :
                "<div class='listitem'>" +
                "<div class='boughtstate " + itemboughtclass + "'></div>" +
                "<div class='mylistsitemtextpane'>" +
                "<div class='itemname'>" + item.name + "</div>" +
                "<div class='itemstore'>" + item.store + "</div>" +
                "<div class='itemtype'>" + item.type + "</div>" +
                "</div>" +
                "<img src='" + item.image + "' />" +
                "<div class='favoritestate " + itemisfavoriteclass + "'></div>" +
                "</div>",
              handlerMap : {
                'div.boughtstate' : {
                  'click':function() {
                    MyListsView.onMyListsItemClicked(this, item._id);
                  }
                },
                'div.mylistsitemtextpane' : {
                  'mousedown touchstart':function() {
                    ShoppingListApp.onMouseDownOnItem(item._id,escape(item.name));
                  },
                  'mouseup mouseout touchend touchmove touchcancel':function() {
                    ShoppingListApp.clearLongPressTimeout();
                  }
                },
                'div.favoritestate' : {
                  'click':function() {
                    MyListsView.onMyListsItemIsFavoriteClicked(this,item._id);
                  }
                }
              }
            };

            return retVal;
        };

        self.onMyListsItemClicked = function(element, id) {
            ShoppingListApp.buttonClick02Audio.play();

            if (ShoppingListApp.isLongPress) {
                ShoppingListApp.isLongPress = false;
                return;
            }
            ShoppingListApp.DBManager.updateItemBought(id, (element.getAttribute("class") == "boughtstate itembought") ? 0 : 1, self.updateItemBoughtCallback);
        };

        self.onMyListsItemIsFavoriteClicked = function(element, id) {
            ShoppingListApp.buttonClick03Audio.play();

            ShoppingListApp.DBManager.updateItemFavorite(id, (element.getAttribute("class") == "favoritestate itemisfavorite") ? 0 : 1, self.updateItemIsFavoriteCallback);
        };

        self.updateItemBoughtCallback = function(result) {
            self.populateListOfLists();
            self.populateCurrentList();
        };

        self.updateItemIsFavoriteCallback = function(result) {
            self.populateCurrentList();
        };
    };

    MyStoresView = new function() {
        var self = this;

        self.populateListOfLists = function() {
            self.populateListOfListsMain();
        };

        self.populateListOfListsMain = function() {
            self.resetListOfLists = true;
            self.renderListOfListsItem = self.renderListOfListsItemMain;
            self.populateActiveListPane = self.populateActiveListPaneMain;
            self.populateListOfListsNextPhase = self.populateListOfListsViewAll;
            ShoppingListApp.DBManager.selectStoreData(ShoppingListApp.populateListOfListsCallback);
        };

        self.populateListOfListsViewAll = function() {
            self.resetListOfLists = false;
            self.renderListOfListsItem = self.renderViewAllListOfListsItem;
            self.populateActiveListPane = self.populateViewAllActiveListPane;
            self.populateListOfListsNextPhase = function() {}; // No next phase, we're done.
            ShoppingListApp.DBManager.selectAllItemData(ShoppingListApp.populateListOfListsCallback);
        };

        self.populateActiveListPaneMain = function(item) {
            var retVal = {
                innerHTML :
                   "<div class='activelistnarrow green'>" +
                       "<div class='activelistinfopane'>" +
                           "<div class='activelistitemcount'>" + item.boughtcount + "/" + item.totalcount + "</div>" +
                           "<div class='activelistname'>" + item.name + "</div>" +
                       "</div>" +
                       "<div class='activelistbutton'></div>" +
                   "</div>" +
                   "<button id='activelistaddnewlistbutton' class='shoppinglistbutton'></button>",
                handlerMap : {
                  'div.activelistnarrow' : {
                    'mousedown touchstart':function() {
                      ShoppingListApp.onMouseDownOnStore(escape(item.name));
                    },
                    'mouseup mouseout touchend touchmove touchcancel':function() {
                      ShoppingListApp.clearLongPressTimeout();
                    },
                    'click':function() {
                      ShoppingListApp.onListOfListsRowClicked(escape(item.name));
                    }
                  },
                  'div.activelistbutton' : {
                    'click':function() {
                      MyStoreSelectionDialog.showStoreSelectionDialog(ShoppingListApp.activelistSelectedCallback, true);
                    }
                  },
                  '#activelistaddnewlistbutton' : {
                    'click':function() {
                      addStoreDialog.show(VIEW_MODE.NEW);
                    }
                  }
                }
            };

            return retVal;
        };

        self.populateViewAllActiveListPane = function(item) {
            var retVal = {
                innerHTML :
                   "<div class='activelistnarrow green_2'>" +
                       "<div class='activelistinfopane'>" +
                          "<div class='activelistitemcount'>" + item.boughtcount + "/" + item.totalcount + "</div>" +
                          "<div class='activelistname'>" + Localizer.getTranslation("view_all") + "</div>" +
                       "</div>" +
                       "<div class='activelistbutton'></div>" +
                   "</div>" +
                   "<button id='activelistaddnewlistbutton' class='shoppinglistbutton'></button>",
                handlerMap : {
                  'div.activelistnarrow' : {
                    'click' : function() {
                      ShoppingListApp.onListOfListsRowClicked(ShoppingListApp.ALL_KEY);
                    }
                  },

                  'div.activelistbutton' : {
                    'click' : function() {
                      MyStoreSelectionDialog.showStoreSelectionDialog(ShoppingListApp.activelistSelectedCallback, true);
                    }
                  },

                  '#activelistaddnewlistbutton' : {
                    'click' : function() {
                      addStoreDialog.show(VIEW_MODE.NEW);
                    }
                  }
                }
            };

            return retVal;
        };

        self.getOptionsPaneParameters = function() {
            return {
                listpane: "addnewlistpane black",
                addNewListButtonVisibility: "visible",
                addNewListText: Localizer.getTranslation("add_new_store"),
                addButtonOnClick: function() { addStoreDialog.show(VIEW_MODE.NEW); }
            };
        };

        self.getViewSwitcherPaneButtonStates = function() {
            return {
               mylistsbuttonClass: "shoppinglistbutton mylistsbutton",
               mystoresbuttonClass: "shoppinglistbutton mystoresbuttonselected",
               myfavoritesbuttonClass: "shoppinglistbutton myfavoritesbutton"
            };
        };

        self.renderListOfListsItemMain = function(item) {
            var itemcountclass = (ShoppingListApp.currentKey === item.name) ? "listitemcount_selected" : "";
            var itemnameclass = (ShoppingListApp.currentKey === item.name) ? "listitemname_selected" : "";

            var retVal = {
                innerHTML :
                   "<div class='listoflistsrow green'>" +
                       "<div class='listoflistsitemcount " + itemcountclass + "'>" + item.boughtcount + "/" + item.totalcount + "</div>" +
                       "<div class='listoflistsname " + itemnameclass + "'>" + item.name + "</div>" +
                   "</div>",
                handlerMap : {
                  'div.listoflistsrow' : {
                    'mousedown':function() {
                      ShoppingListApp.onMouseDownOnStore(escape(item.name));
                    },
                    'mouseup mouseout touchend touchmove touchcancel':function() {
                      ShoppingListApp.clearLongPressTimeout();
                    },
                    'touchstart':function() {
                      ShoppingListApp.onMouseDownOnStore(escape(item.name));
                    },
                    'click':function() {
                      ShoppingListApp.onListOfListsRowClicked(escape(item.name));
                    }
                  }
                }
            };

            return retVal;
        };

        self.renderViewAllListOfListsItem = function(item) {
            var itemcountclass = (ShoppingListApp.currentKey === ShoppingListApp.ALL_KEY) ? "listitemcount_selected" : "";
            var itemnameclass = (ShoppingListApp.currentKey === ShoppingListApp.ALL_KEY) ? "listitemname_selected" : "";
            var retVal = {
              innerHTML :
                "<div class='listoflistsrow green_2'" +
                  "<div class='listoflistsitemcount " + itemcountclass + "'>" + item.boughtcount + "/" + item.totalcount + "</div>" +
                  "<div class='listoflistsname " + itemnameclass + "'>" + Localizer.getTranslation("view_all") + "</div>" +
                "</div>",
              handlerMap : {
                'div.listoflistsrow' : {
                  'click' : function() {
                    ShoppingListApp.onListOfListsRowClicked(ShoppingListApp.ALL_KEY);
                  }
                }
              }
            };

            return retVal;
        };

        self.populateCurrentList = function() {
            if (ShoppingListApp.currentKey === ShoppingListApp.ALL_KEY) {
                ShoppingListApp.DBManager.selectAllItems(ShoppingListApp.populateCurrentListCallback, ShoppingListApp.searchPattern.value);
            } else {
                ShoppingListApp.DBManager.selectItemsFromStore(ShoppingListApp.currentKey, ShoppingListApp.populateCurrentListCallback, ShoppingListApp.searchPattern.value);
            }
        };

        self.renderCurrentListItem = function(item) {
            var itemboughtclass = (item.bought == 1) ? "itembought" : "itemnotbought";
            var itemisfavoriteclass = (item.favorite == 1) ? "itemisfavorite" : "itemisnotfavorite";
            var retVal = {
                innerHTML :
                   "<div class='listitem'>" +
                       "<div class='boughtstate " + itemboughtclass + "'></div>" +
                       "<div class='mystoresitemlistindicator " + item.color + "'></div>" +
                       "<div class='mystoresitemtextpane' "+

                                   ">" +
                           "<div class='itemname'>" + item.name + "</div>" +
                           "<div class='itemstore'>" + item.store + "</div>" +
                           "<div class='itemtype'>" + item.type + "</div>" +
                       "</div>" +
                       "<img src='" + item.image + "' />" +
                       "<div class='favoritestate " + itemisfavoriteclass + "'></div>" +
                   "</div>",
                handlerMap : {
                  'div.boughtstate' : {
                    'click':function() {
                      MyStoresView.onMyStoresItemClicked(this, item._id);
                    }
                  },
                  'div.mystoresitemtextpane' : {
                    'mousedown touchstart':function() {
                      ShoppingListApp.onMouseDownOnItem(item._id,escape(item.name));
                    },
                    'mouseup mouseout touchend touchmove touchcancel':function() {
                      ShoppingListApp.clearLongPressTimeout();
                    }
                  },
                  'div.favoritestate' : {
                    'click':function() {
                      MyStoresView.onMyStoresItemIsFavoriteClicked(this, item._id);
                    }
                  }
                }
            };

            return retVal;
        };

        self.onMyStoresItemClicked = function(element, id) {
            ShoppingListApp.buttonClick02Audio.play();

            if (ShoppingListApp.isLongPress) {
                ShoppingListApp.isLongPress = false;
                return;
            }
            ShoppingListApp.DBManager.updateItemBought(id, (element.getAttribute("class") == "boughtstate itembought") ? 0 : 1, self.updateItemBoughtCallback);
        };

        self.updateItemBoughtCallback = function(result) {
            self.populateListOfLists();
            self.populateCurrentList();
        };

        self.onMyStoresItemIsFavoriteClicked = function(element, id) {
            ShoppingListApp.buttonClick03Audio.play();

            ShoppingListApp.DBManager.updateItemFavorite(id, (element.getAttribute("class") == "favoritestate itemisfavorite") ? 0 : 1, self.updateItemIsFavoriteCallback);
        };

        self.updateItemIsFavoriteCallback = function(result) {
            self.populateCurrentList();
        };
    };

    MyFavoritesView = new function() {
        var self = this;

        self.populateListOfLists = function() {
            self.populateListOfListsAllMyFavorites();
        };

        self.populateListOfListsMain = function() {
            self.resetListOfLists = false;
            self.renderListOfListsItem = self.renderListOfListsItemMain;
            self.populateActiveListPane = self.populateActiveListPaneMain;
            self.populateListOfListsNextPhase = function() {}; // No next phase, we're done.
            ShoppingListApp.DBManager.selectFavoritesData(ShoppingListApp.populateListOfListsCallback);
        };

        self.populateListOfListsAllMyFavorites = function() {
            self.resetListOfLists = true;
            self.renderListOfListsItem = self.renderAllMyFavoritesListOfListsItem;
            self.populateActiveListPane = self.populateAllMyFavoritesActiveListPane;
            self.populateListOfListsNextPhase = self.populateListOfListsMain;
            ShoppingListApp.DBManager.selectAllFavoriteItemData(ShoppingListApp.populateListOfListsCallback);
        };

        self.populateActiveListPaneMain = function(item) {
          var retVal = {
            innerHTML :
              "<div class='activelistwide " + item.color + "'>" +
                "<div class='activelistinfopane'>" +
                  "<div class='activelistitemcount'>" + item.totalcount + "</div>" +
                  "<div class='activelistname'>" + item.name + "</div>" +
                "</div>" +
                "<div class='activelistbutton'></div>" +
              "</div>",
            handlerMap : {
              'div.activelistwide' : {
                'click':function() {
                  ShoppingListApp.onListOfListsRowClicked(escape(item.name));
                },
                'mousedown touchstart':function() {
                  ShoppingListApp.onMouseDownOnList(escape(item.name),item.color);
                  ShoppingListApp.onMouseDownOnList(escape(item.name),item.color);
                },
                'mouseup mouseout touchend touchmove touchcancel':function() {
                  ShoppingListApp.clearLongPressTimeout();
                }
              },
              'div.activelistbutton' : {
                'click':function() {
                  MyListSelectionDialog.showListSelectionDialog(ShoppingListApp.activelistSelectedCallback, true);
                }
              }
            }
          };

            return retVal;
        };

        self.populateAllMyFavoritesActiveListPane = function(item) {
            var retVal = {
                innerHTML :
                   "<div class='activelistwide green_2'>" +
                       "<div class='activelistinfopane'>" +
                          "<div class='activelistitemcount'>" + item.totalcount + "</div>" +
                          "<div class='activelistname'>" + Localizer.getTranslation("all_my_favorites") + "</div>" +
                       "</div>" +
                       "<div class='activelistbutton'></div>" +
                   "</div>",
                handlerMap : {
                  'div.activelistwide' : {
                    'click':function() {
                      ShoppingListApp.onListOfListsRowClicked(ShoppingListApp.ALL_KEY);
                    }
                  },
                  'div.activelistbutton' : {
                    'click':function() {
                      MyListSelectionDialog.showListSelectionDialog(ShoppingListApp.activelistSelectedCallback);
                    }
                  }
                }
            };

            return retVal;
        };

        self.getOptionsPaneParameters = function() {
            return {
                listpane: "addnewlistpane gray",
                addNewListButtonVisibility: "hidden",
                addNewListText: "",
                addButtonOnClick: function() {}
            };
        };

        self.getViewSwitcherPaneButtonStates = function() {
            return {
               mylistsbuttonClass: "shoppinglistbutton mylistsbutton",
               mystoresbuttonClass: "shoppinglistbutton mystoresbutton",
               myfavoritesbuttonClass: "shoppinglistbutton myfavoritesbuttonselected"
            };
        };

        self.renderListOfListsItemMain = function(item) {
            var itemcountclass = (ShoppingListApp.currentKey === item.name) ? "listitemcount_selected" : "";
            var itemnameclass = (ShoppingListApp.currentKey === item.name) ? "listitemname_selected" : "";
            var retVal = {
                innerHTML :
                   "<div class='listoflistsrow " + item.color + "'>" +
                       "<div class='listoflistsitemcount " + itemcountclass + "'>" + item.totalcount + "</div>" +
                       "<div class='listoflistsname " + itemnameclass + "'>" + item.name + "</div>" +
                   "</div>",
                handlerMap : {
                  'div.listoflistsrow' : {
                    'click':function() {
                      ShoppingListApp.onListOfListsRowClicked(escape(item.name));
                    },
                    'mousedown touchstart':function() {
                      ShoppingListApp.onMouseDownOnList(escape(item.name),item.color);
                    },
                    'mouseup mouseout touchend touchmove touchcancel':function() {
                      ShoppingListApp.clearLongPressTimeout();
                    }
                  }
                }
            };

            return retVal;
        };

        self.renderAllMyFavoritesListOfListsItem = function(item) {
            var itemcountclass = (ShoppingListApp.currentKey === ShoppingListApp.ALL_KEY) ? "listitemcount_selected" : "";
            var itemnameclass = (ShoppingListApp.currentKey === ShoppingListApp.ALL_KEY) ? "listitemname_selected" : "";
            var retVal = {
                innerHTML :
                   "<div class='listoflistsrow green_2'>" +
                       "<div class='listoflistsitemcount " + itemcountclass + "'>" + item.totalcount + "</div>" +
                       "<div class='listoflistsname " + itemnameclass + "'>" + Localizer.getTranslation("all_my_favorites") + "</div>" +
                   "</div>",
                handlerMap : {
                  'div.listoflistsrow' : {
                    'click':function() {
                      ShoppingListApp.onListOfListsRowClicked(ShoppingListApp.ALL_KEY);
                    }
                  },
                }
            };

            return retVal;
        };

        self.populateCurrentList = function() {
            if (ShoppingListApp.currentKey === ShoppingListApp.ALL_KEY) {
                ShoppingListApp.DBManager.selectAllItemsFromFavorites(ShoppingListApp.populateCurrentListCallback, ShoppingListApp.searchPattern.value);
            } else {
                ShoppingListApp.DBManager.selectItemsFromFavorites(ShoppingListApp.currentKey, ShoppingListApp.populateCurrentListCallback, ShoppingListApp.searchPattern.value);
            }
        };

        self.renderCurrentListItem = function(item) {
            var itemisfavoriteclass = (item.favorite == 1) ? "itemisfavorite" : "itemisnotfavorite";
            var itemlistindicator = (ShoppingListApp.currentKey === ShoppingListApp.ALL_KEY) ? "<div class='myfavoritesitemlistindicator " + item.color + "'></div>" : "";
            var textpane = (ShoppingListApp.currentKey === ShoppingListApp.ALL_KEY) ? "allmyfavoritesitemtextpane" : "myfavoritesitemtextpane";
            var handlerMap = {};
            handlerMap['div.'+textpane] = {
                    'mousedown touchstart':function() {
                      ShoppingListApp.onMouseDownOnItem(item._id,escape(item.name));
                    },
                    'mouseup mouseout touchend touchmove touchcancel':function() {
                      ShoppingListApp.clearLongPressTimeout();
                    }
                  };
            handlerMap['div.favoritestate'] = {
                    'click':function() {
                      MyFavoritesView.onMyFavoritesItemIsFavoriteClicked(this,item._id);
                    }
                  };
            var retVal = {
                innerHTML :
                   "<div class='listitem'>" +
                       itemlistindicator +
                       "<div class='" + textpane + "'>" +
                           "<div class='itemname'>" + item.name + "</div>" +
                           "<div class='itemstore'>" + item.store + "</div>" +
                           "<div class='itemtype'>" + item.type + "</div>" +
                       "</div>" +
                        "<img src='" + item.image + "' />" +
                        "<div class='favoritestate " + itemisfavoriteclass + "'>" +
                   "</div>",
                handlerMap : handlerMap
            };

            return retVal;

        };

        self.onMyFavoritesItemIsFavoriteClicked = function(element, id) {
            ShoppingListApp.buttonClick03Audio.play();

            ShoppingListApp.DBManager.updateItemFavorite(id, 0, self.updateItemIsFavoriteCallback);
        };

        self.updateItemIsFavoriteCallback = function(result) {
            self.populateListOfLists();
            self.populateCurrentList();
        };
    };

    function SorterBase() {
        var self = this;

        self.resetHeading = function() {
            self.currentHeading = null;
        };

        self.renderCurrentListHeadingBase = function(heading) {
            var ret = "";

            if (self.currentHeading != heading) {
                ret = "<div class='currentlistheading'><div class='currentlistheadingtextpane'>" + heading + "</div></div>";
            }

            self.currentHeading = heading;

            return ret;
        }
    };

    AlphabeticallySorter = new function() {
        var self = new SorterBase();

        self.setDbSorter = function() {
            ShoppingListApp.DBManager.itemOrderMode = ShoppingListApp.DBManager.orderItemsByName;
        };

        self.renderCurrentListHeading = function(item) {
            return ""; // No headings when sorting alphabetically.
        };

        return self;
    };

    StoreSorter = new function() {
        var self = new SorterBase();

        self.setDbSorter = function() {
            ShoppingListApp.DBManager.itemOrderMode = ShoppingListApp.DBManager.orderItemsByStoreThenName;
        };

        self.renderCurrentListHeading = function(item) {
            return self.renderCurrentListHeadingBase((item.store == "") ? Localizer.getTranslation("no_store") : item.store);
        };

        return self;
    };

    TypeSorter = new function() {
        var self = new SorterBase();

        self.setDbSorter = function() {
            ShoppingListApp.DBManager.itemOrderMode = ShoppingListApp.DBManager.orderItemsByTypeThenName;
        };

        self.renderCurrentListHeading = function(item) {
            return self.renderCurrentListHeadingBase((item.type == "") ? Localizer.getTranslation("no_type") : item.type);
        };

        return self;
    };

    BoughtStatusSorter = new function() {
        var self = new SorterBase();

        self.setDbSorter = function() {
            ShoppingListApp.DBManager.itemOrderMode = ShoppingListApp.DBManager.orderItemsByBoughtThenName;
        };

        self.renderCurrentListHeading = function(item) {
            return ""; // No headings when sorting by bought status.
        };

        return self;
    };

    ShoppingListApp = new function() {
        var self = this;

        // Init the application when the OnLoad event is received.
        //
        self.initOnLoad = function() {
            license_init("license", "background");
            help_init("home_help", "help_");

            // Prevent default touch behavior and enable iScroll.
            document.addEventListener('touchmove', function(e){ e.preventDefault(); });
            self.listoflistsscroll = new iScroll('listoflistspane');
            self.currentlistscroll = new iScroll('currentlistpane');

            // initialize views and dialogs
            editListScreen = new EditListScreen();
            editItemScreen = new EditItemScreen();
            addStoreDialog = new AddStoreDialog();
            photoFullScreenView = new PhotoFullScreenView();

            // Initialize sort option
            self.setSortOption(1);

            // Initialize member data
            self.searchPattern = document.getElementById("searchinput");
            self.listoflists = document.getElementById('listoflists');
            self.currentlist = document.getElementById('currentlist');
            self.activelist = document.getElementById('activelist');
            self.addNewListPane = document.getElementById("addnewlistpane");
            self.addNewListButton = document.getElementById("addnewlistbutton");
            self.addNewListText = document.getElementById("addnewlisttext");
            self.mylistsbutton = document.getElementById("mylistsbutton");
            self.mystoresbutton = document.getElementById("mystoresbutton");
            self.myfavoritesbutton = document.getElementById("myfavoritesbutton");

            MyListSelectionDialog.initOnLoad();
            MyStoreSelectionDialog.initOnLoad();

            self.buttonClick01Audio = new Audio();
            self.buttonClick01Audio.src = "./audio/ButtonClick_01.ogg";
            self.buttonClick02Audio = new Audio();
            self.buttonClick02Audio.src = "./audio/ButtonClick_01.ogg";
            self.buttonClick03Audio = new Audio();
            self.buttonClick03Audio.src = "./audio/ButtonClick_01.ogg";

            // Localize static HTML elements.
            document.getElementById("searchinput").placeholder = Localizer.getTranslation("enter_keyword");
            document.getElementById("addnewitemtext").innerHTML = Localizer.getTranslation("add");

            self.ALL_KEY = -1; // Special key for use with the 'View All' and 'All My Favorites' lists.

            self.setOrientation();
            self.transitionTo(MyListsView);

            window.localStorage.removeItem( "videoStreamUrl" );
            FileSystem.initialize();
        };

        self.activelistSelectedCallback = function(name, listColor) {
            // listColor is used only in MyListsView
            ShoppingListApp.currentKey = name;
            ShoppingListApp.updateListOfLists();
            ShoppingListApp.updateCurrentList();
        };

        // Transition into the view given as an argument.
        //
        self.transitionTo = function(view) {
            if (self.currentView != view) {
            // do not clear the list here, as it creates a flicker because of
            // the async nature of database operations. so, clear once the
            // database operation is completed
                self.currentView = view;
                self.currentKey = self.ALL_KEY;
                self.updateListOfLists();
                self.updateCurrentList();
                self.initializeOptionsPane();
                self.initializeViewSwitcherButtons();
            }
        };

        self.onMyListsButtonClicked = function() {
            self.buttonClick01Audio.play();

            self.transitionTo(MyListsView);
        };

        self.onMyStoresButtonClicked = function() {
            self.buttonClick01Audio.play();

            self.transitionTo(MyStoresView);
        };

        self.onMyFavoritesButtonClicked = function() {
            self.buttonClick01Audio.play();

            self.transitionTo(MyFavoritesView);
        };

        self.initializeOptionsPane = function() {
            var optionsPaneParameters = self.currentView.getOptionsPaneParameters();

            self.addNewListPane.setAttribute("class", optionsPaneParameters.listpane);
            self.addNewListButton.style.visibility = optionsPaneParameters.addNewListButtonVisibility;
            self.addNewListButton.onclick = optionsPaneParameters.addButtonOnClick;
            self.addNewListText.innerHTML = optionsPaneParameters.addNewListText;
        };

        self.initializeViewSwitcherButtons = function() {
            var viewSwitcherPaneButtonStates = self.currentView.getViewSwitcherPaneButtonStates();

            self.mylistsbutton.setAttribute("class", viewSwitcherPaneButtonStates.mylistsbuttonClass);
            self.mystoresbutton.setAttribute("class", viewSwitcherPaneButtonStates.mystoresbuttonClass);
            self.myfavoritesbutton.setAttribute("class", viewSwitcherPaneButtonStates.myfavoritesbuttonClass);
        };

        self.populateListOfListsCallback = function(result) {
            if (self.currentView.resetListOfLists) {
                ShoppingListApp.listoflists.innerHTML = "";
            }

            for (var i = 0; i < result.length; i++) {
                var tmp = self.currentView.renderListOfListsItem(result.item(i));

                var $element = $(tmp.innerHTML);

                // add event handlers
                $.each(tmp.handlerMap,function(selector, handlerMap) {
                  var $selectedElement = $element.find(selector).addBack(selector);
                  if ($selectedElement.length==0) {
                    console.log("Error:"+selector+" did not match any elements in tree, so event handler(s) won't attach");
                  }
                  $selectedElement.on(handlerMap);
                });

                // append to listoflists
                $(self.listoflists).append($element);

                if (result.item(i).name == self.currentKey) {
                    var tmp = self.currentView.populateActiveListPane(result.item(i));
                    var $element = $(tmp.innerHTML);

                    // add event handlers
                    $.each(tmp.handlerMap, function(selector, handlerMap) {
                      var $selectedElement = $element.find(selector).addBack(selector);
                      if ($selectedElement.length==0) {
                        console.log("Error:"+selector+" did not match any elements in tree, so event handler(s) won't attach");
                      }
                      $selectedElement.on(handlerMap);
                    });

                    // set html of activelist
                    $(self.activelist).html($element);
                }
            }
            self.currentView.populateListOfListsNextPhase();
            self.listoflistsscroll.refresh();
        };

        // Render the current list of the currently active view, with data obtained from a database query.
        //
        self.populateCurrentListCallback = function(result) {
            var $currentList = $(self.currentlist);
            $currentList.empty();

            self.sortbyMethod.resetHeading();

            for (var i = 0; i < result.length; i++) {
                var itemObject = self.currentView.renderCurrentListItem(result.item(i));
                var $listItem = $(itemObject.innerHTML);

                // add event handlers
                $.each(itemObject.handlerMap, function(selector,handlerMap) {
                  var $selectedElement = $listItem.find(selector).addBack(selector);
                  if ($selectedElement.length==0) {
                    console.log("Error:"+selector+" did not match any elements in tree, so event handler(s) won't attach");
                  }
                  $selectedElement.on(handlerMap);
                });

                $currentList.append( self.sortbyMethod.renderCurrentListHeading(result.item(i)) );
                $currentList.append( $listItem );
            }
            self.currentlistscroll.refresh();

            $('#currentlistempty').text(Localizer.getTranslation("empty_list"));
            (result.length <= 0) ? $('#currentlistempty').show(): $('#currentlistempty').hide();
        };

        // Event handler that populates the current list of the currently active view.
        //
        self.onListOfListsRowClicked = function(key) {
            self.buttonClick01Audio.play();

            if(key != ShoppingListApp.ALL_KEY)
                self.currentKey = unescape(key);
            else {
                self.currentKey = key;
            }
            self.currentView.populateListOfLists();
            self.currentView.populateCurrentList();
        };

        // Handle longtap for lists
        //
        self.onMouseDownOnList = function(listName, listColor) {
            self.selectedListName = unescape(listName);
            self.selectedListColor = listColor;
            self.pressTimer = window.setTimeout(ShoppingListApp.openListOptions, 1000);
        };

        // Clear the long press detection timeout.
        //
        self.clearLongPressTimeout = function() {
            clearTimeout(self.pressTimer);
        };

        self.openListOptions = function() {
            clearTimeout(self.pressTimer);
            showListOptions(self.handleListOption, self.selectedListName);
        };

        // Handle longtap for list items
        //
        self.onMouseDownOnItem = function(itemId, itemName) {
            self.selectedItemId = itemId;
            self.selectedItemName = unescape(itemName);
            self.pressTimer = window.setTimeout(ShoppingListApp.openItemOptions, 1000);
        };

        self.openItemOptions = function() {
            clearTimeout(self.pressTimer);
            self.isLongPress = true;
            showItemOptions(self.handleItemOption, self.selectedItemName);
        };

        // Handle longtap for stores
        //
        self.onMouseDownOnStore = function(storeName) {
            self.selectedStoreName = unescape(storeName);
            self.pressTimer = window.setTimeout(ShoppingListApp.openStoreOptions, 1000);
        };

        self.openStoreOptions = function() {
            clearTimeout(self.pressTimer);
            showStoreOptions(self.handleStoreOption, self.selectedStoreName);
        };

        self.handleListOption = function(option) {
            switch(option) {
            case 1:
                // Edit list
                editListScreen.show(
                        VIEW_MODE.EDIT,
                        self.selectedListName,
                        self.selectedListColor);
                break;
            case 2:
                // Uncheck all list items
                self.DBManager.uncheckAllListItems(self.selectedListName);
                break;
            case 3:
                // Move all list items to
                MyListSelectionDialog.showListSelectionDialog(self.moveAllListItemsTo);
                break;
            case 4:
                // Delete all items from list
                showQuestionDialog(
                        // TODO - localize
                        "This action will remove all items from the " + self.selectedListName + " list.",
                        null, // No button handler
                        self.deleteItemsFromList);
                break;
            case 5:
                showQuestionDialog(
                        "This action will remove all items from the " + self.selectedListName + " list.",
                        null, // No button handler
                        self.deleteItemsAndList);
                break;
            default:
              break;
            }

            self.updateListOfLists();
            self.updateCurrentList();
        };

        self.deleteItemsFromList = function() {
            self.DBManager.deleteAllItemsFromList(self.selectedListName);
            self.updateListOfLists();
            self.updateCurrentList();
        };

        self.deleteItemsAndList = function() {
            self.DBManager.deleteAllItemsFromList(self.selectedListName);
            self.DBManager.deleteList(self.selectedListName);
            self.currentKey = self.ALL_KEY;
            self.updateListOfLists();
            self.updateCurrentList();
        };

        self.handleItemOption = function(option) {
            switch(option) {
            case 1:
                // Edit item
                editItemScreen.show(
                        VIEW_MODE.EDIT,
                        self.selectedItemId);
                break;
            case 2:
                // Move item to
                MyListSelectionDialog.showListSelectionDialog(self.moveSelectedItemTo);
                break;
            case 3:
                // Delete item
                showQuestionDialog(
                        "This action will remove the item.",
                        null, // No button handler
                        self.deleteItem);
                break;
            default:
              break;
            }

            // Update UI
            self.updateListOfLists();
            self.updateCurrentList();
        };

        self.deleteItem = function() {
            self.DBManager.deleteItem(self.selectedItemId);
            self.updateListOfLists();
            self.updateCurrentList();
        };

        self.handleStoreOption = function(option) {
            switch(option) {
            case 1:
                // Change name
                addStoreDialog.show(VIEW_MODE.EDIT, self.selectedStoreName);
                break;
            case 2:
                // Uncheck all store items
                self.DBManager.uncheckAllStoreItems(self.selectedStoreName);
                break;
            case 3:
                // Move all store items to
                MyStoreSelectionDialog.showStoreSelectionDialog(self.moveAllStoreItemsTo);
                break;
            case 4:
                // Remove all store items
                showQuestionDialog(
                        "This action will remove all items from the " + self.selectedStoreName + " store.",
                        null, // No button handler
                        self.deleteItemsFromStore);
                break;
            case 5:
                showQuestionDialog(
                        "This action will remove the store.",
                        null, // No button handler
                        self.deleteStore);
                break;
            default:
              break;
            }

            // Update UI
            self.updateListOfLists();
            self.updateCurrentList();
        };

        self.deleteItemsFromStore = function() {
            self.DBManager.deleteAllItemsFromStore(self.selectedStoreName);
            self.updateListOfLists();
            self.updateCurrentList();
        };

        self.deleteStore = function() {
            // First set no store to all those items in the store
            self.DBManager.updateItemsStoreName(
                    "No store",
                    self.selectedStoreName);

            // Then Delete the store
            self.DBManager.deleteStore(self.selectedStoreName);

            self.updateListOfLists();
            self.updateCurrentList();
        };

        self.handleSortOption = function(option) {
            self.setSortOption(option);
            self.updateCurrentList();
        };

        self.setSortOption = function(option) {
            self.sortbyOption = option;

            if (option === 1) {
                self.sortbyMethod = AlphabeticallySorter;
            }
            else if (option === 2) {
                self.sortbyMethod = StoreSorter;
            }
            else if (option === 3) {
                self.sortbyMethod = TypeSorter;
            }
            else if (option === 4) {
                self.sortbyMethod = BoughtStatusSorter;
            }
            self.sortbyMethod.setDbSorter();
        };

        self.moveAllListItemsTo = function(newListName, color) {
            // update items list name
            ShoppingListApp.DBManager.updateItemsListName(
                    newListName,
                    self.selectedListName); // current listname
            // Update UI
            self.updateListOfLists();
            self.updateCurrentList();
        };

        self.moveSelectedItemTo = function(newListName, color) {
            ShoppingListApp.DBManager.updateSingleItemListName(
                    newListName,
                    self.selectedItemId);
            self.updateListOfLists();
            self.updateCurrentList();
        };

        self.moveAllStoreItemsTo = function(newStoreName) {
            ShoppingListApp.DBManager.updateItemsStoreName(
                    newStoreName,
                    self.selectedStoreName);
            self.updateListOfLists();
            self.updateCurrentList();
        };

        // Update the list of lists of the current view.
        //
        self.updateListOfLists = function() {
            self.currentView.populateListOfLists();
        };

        // Update the current list, if one is selected.
        //
        self.updateCurrentList = function() {
            self.currentView.populateCurrentList();
        };

        // Callback to used to notify that a list or store name has changed.
        //
        self.updateListOrStoreName = function(oldName, newName) {
            // If the currently displayed list is the list which was modified, then update its name.
            if (ShoppingListApp.currentKey === oldName) {
                ShoppingListApp.currentKey = newName;
            }
        };

        // Show the search pane and hide the view switcher pane.
        //
        self.onSearchButtonClick = function() {
            ShoppingListApp.buttonClick02Audio.play();

            document.getElementById('viewswitcherpane').style.display="none";
            document.getElementById('searchpane').style.display="inline";
            self.searchPattern.focus();
        };

        self.onClearSearchButtonClick = function() {
            ShoppingListApp.buttonClick02Audio.play();

            self.setSearchPattern('');
        }

        // Hide the search pane and show the view switcher pane.
        //
        self.onSearchBackButtonClick = function() {
            ShoppingListApp.buttonClick02Audio.play();

            document.getElementById('viewswitcherpane').style.display="inline";
            document.getElementById('searchpane').style.display="none";
            self.setSearchPattern('');
        };

        // Create the application's SQL database.
        //
        self.createDB = function() {
            self.DBManager = new DBManager();
        };

        // Set the pattern used for searches.
        //
        self.setSearchPattern = function(pattern) {
            self.searchPattern.value = pattern;
            self.searchPattern.focus();
            self.updateCurrentList();
        };

        // disable form submits on enter key presses
        //
        self.handleKeyPress = function(event) {
            var key;
            if(window.event) {
                key = window.event.keyCode;
            } else {
                key = event.which;
            }
            return (key != 13);
        };

        self.setOrientation = function() {
            var clientHeight = document.documentElement.clientHeight;
            var clientWidth = document.documentElement.clientWidth;

            var orientation = (clientHeight > clientWidth ?
                               'portrait' :
                               'landscape');

            switch(orientation) {
              case 'portrait':
                  // portrait mode
                  document.getElementById('sl_style').href='css/sl_portrait.css';
                  document.getElementById('editlist_view_style').href='css/editlist_view_portrait.css';
                  document.getElementById('edititem_view_style').href='css/edititem_view_portrait.css';
                  document.getElementById('favorites_view_style').href='css/addfromfavorites_view_portrait.css';
                  document.getElementById('photofullscreen_view_style').href='css/photofullscreen_view_portrait.css';
                  document.getElementById('shadow').style.height = '1280px';
                  document.getElementById('shadow').style.width = '720px';
                  break;

              case 'landscape': // landscape mode
                  document.getElementById('sl_style').href='css/sl_landscape.css';
                  document.getElementById('editlist_view_style').href='css/editlist_view_landscape.css';
                  document.getElementById('edititem_view_style').href='css/edititem_view_landscape.css';
                  document.getElementById('favorites_view_style').href='css/addfromfavorites_view_landscape.css';
                  document.getElementById('photofullscreen_view_style').href='css/photofullscreen_view_landscape.css';
                  document.getElementById('shadow').style.height = '720px';
                  document.getElementById('shadow').style.width = '1280px';
                  break;
            }

            self.listoflistsscroll.refresh();
            self.currentlistscroll.refresh();

            if(editListScreen) {
                editListScreen.updateColorLabel();
            }

            MyListSelectionDialog.updateStyles();
            MyStoreSelectionDialog.updateStyles();

            if(currentSortbyDialog) {
                currentSortbyDialog.updateStyles();
            }

            if(currentOptionsDialog) {
                currentOptionsDialog.updateStyles();
            }

            if(currentInfoDialog) {
                currentInfoDialog.updateStyles();
            }

            if(currentAddStoreDialog) {
                currentAddStoreDialog.updateStyles();
            }

            if(currentPhotoFullScreenView) {
                currentPhotoFullScreenView.updateStyles();
            }
        };

        // register for the orientation event changes;
        // NB we use onresize as onorientationchange isn't fired
        // by Crosswalk
        window.onresize = function() {
            self.setOrientation();
        }

        self.createDB();
    };

    function registerEventHandlers() {
        var map = {
            'body' : {
                'keypress' : function(event) {
                    return ShoppingListApp.handleKeyPress(event);
                }
            },
            '#mylistsbutton' : {
                'click' : function() {
                    ShoppingListApp.onMyListsButtonClicked();
                }
            },
            '#mystoresbutton' : {
                'click' : function() {
                    ShoppingListApp.onMyStoresButtonClicked();
                }
            },
            '#myfavoritesbutton' : {
                'click' : function() {
                    ShoppingListApp.onMyFavoritesButtonClicked();
                }
            },
            '#searchcurrentlistbutton' : {
                'click' : function() {
                    ShoppingListApp.onSearchButtonClick();
                }
            },
            '#searchbackbutton' : {
                'click' : function() {
                    ShoppingListApp.onSearchBackButtonClick();
                }
            },
            '#searchremovebutton' : {
                'click' : function() {
                    ShoppingListApp.onClearSearchButtonClick();
                }
            },
            '#searchinput' : {
                'keyup' : function() {
                    ShoppingListApp.setSearchPattern(searchform.searchname.value);
                }
            },
            '#sortcurrentlistbutton' : {
                'click' : function() {
                    showSortbyDialog(ShoppingListApp.sortbyOption, ShoppingListApp.handleSortOption);
                }
            },
            '#addnewitembutton' : {
                'click' : function() {
                    editItemScreen.show(VIEW_MODE.NEW);
                }
            },
            '#storename_input, #item_name_input, #list_name' : {
                'blur' : function() {
                    this.value=adjustSpaces(this.value);
                }
            },
            '#pink_1, #blue_1, #purple_1, #green_1, #yellow_1, #brown_1, #pink_2, #blue_2, #purple_2, #green_2, #yellow_2, #brown_2, #pink_3, #blue_3, #purple_3, #green_3, #yellow_3, #brown_3' : {
                'click' : function(event) {
                    editListScreen.listTypeColorClick(event.target.id);
                }
            }

        };

        $.each(map, function(selector, handlerMap) {
            $(selector).on(handlerMap);
        });

    };

    $(document).ready(function() {
        registerEventHandlers();
        ShoppingListApp.initOnLoad();
    });
})();

