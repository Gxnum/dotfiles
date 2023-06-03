/**
 * @name DisplayServersAsChannels
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.6.8
 * @description Displays Servers in a similar way as Channels
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/DisplayServersAsChannels/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/DisplayServersAsChannels/DisplayServersAsChannels.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		"fixed": {
			"ServerFolders Compatibility": "Better works with ServerFolders Plugin now"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {	
		return class DisplayServersAsChannels extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						showGuildIcon:					{value: true, 	description: "Adds the Server Icon"},
						addFolderColor:					{value: true, 	description: "Recolors the Folder's Server List Background to the Folder Color"},
					},
					amounts: {
						serverListWidth:				{value: 240, 	min: 45,		description: "Server List Width in px: "},
						serverElementHeight:			{value: 32, 	min: 16,		description: "Server Element Height in px: "}
					}
				};
				
				this.patchPriority = 9;

				this.modulePatches = {
					before: [
						"TooltipContainer"
					],
					after: [
						"CircleIconButton",
						"DirectMessage",
						"FolderHeader",
						"FolderItemWrapper",
						"GuildFavorites",
						"GuildItem",
						"GuildsBar",
						"HomeButtonDefault",
						"UnavailableGuildsButton"
					]
				};
				
				this.css = `
					${BDFDB.dotCN.guildlistitemtooltip} {
						display: none;
					}
					${BDFDB.dotCN.forumpagelist} {
						justify-content: flex-start;
					}
					${BDFDB.dotCN.guilds} [style*="--folder-color"] ${BDFDB.dotCN.guildfolderexpandedbackground} {
						background: var(--folder-color) !important;
						opacity: 0.2 !important;
					}
				`;
			}
			
			onStart () {				
				BDFDB.DOMUtils.addClass(document.body, BDFDB.disCN._displayserversaschannelsstyled);

				this.forceUpdateAll();
				this.addCSS();
			}
			
			onStop () {
				BDFDB.DOMUtils.removeClassFromDOM(BDFDB.disCN._displayserversaschannelsstyled);

				BDFDB.DOMUtils.removeLocalStyle("DSACStyle" + this.name);

				this.forceUpdateAll();
			}
		
			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
				
						for (let key in this.defaults.general) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.defaults.general[key].description,
							value: this.settings.general[key]
						}));
						for (let key in this.defaults.amounts) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "TextInput",
							childProps: {
								type: "number"
							},
							plugin: this,
							keys: ["amounts", key],
							label: this.defaults.amounts[key].description,
							basis: "20%",
							min: this.defaults.amounts[key].min,
							max: this.defaults.amounts[key].max,
							value: this.settings.amounts[key]
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
					this.addCSS();
				}
			}
		
			forceUpdateAll () {
				BDFDB.DiscordUtils.rerenderAll();
			}
		
			processGuildsBar (e) {
				let scroller = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.guildsscroller]]});
				if (scroller) {
					scroller.props.fade = true;
					scroller.type = BDFDB.LibraryComponents.Scrollers.Thin;
					let padding = parseInt(BDFDB.LibraryModules.PlatformUtils.isWindows() ? 4 : BDFDB.LibraryModules.PlatformUtils.isDarwin() ? 0 : 12) + 10;
					let isVisible = (currentItem, t, items) => {
						if (!scroller.ref || !scroller.ref.current) return false;
						const index = items.findIndex(item => typeof item == "string" || !item ? currentItem === item : item.includes(currentItem));
						if (index < 0) return false;
						let size = this.settings.amounts.serverElementHeight * index + padding;
						if (!t) size += 40;
						const state = typeof scroller.ref.current.getScrollerState == "function" ? scroller.ref.current.getScrollerState() : Node.prototype.isPrototypeOf(scroller.ref.current) ? scroller.ref.current : {};
						return !!(!t && size >= state.scrollTop || t && size + parseInt(this.settings.amounts.serverElementHeight) <= state.scrollTop + state.offsetHeight);
					};
					let topBar = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.guildswrapperunreadmentionsbartop]]});
					if (topBar) topBar.props.isVisible = BDFDB.TimeUtils.suppress(isVisible, "Error in isVisible of Top Bar in Guild List!");
					let bottomBar = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.guildswrapperunreadmentionsbarbottom]]});
					if (bottomBar) bottomBar.props.isVisible = BDFDB.TimeUtils.suppress(isVisible, "Error in isVisible of Bottom Bar in Guild List!");
				}
			}
			
			processHomeButtonDefault (e) {
				this.removeTooltip(e.returnvalue);
				e.returnvalue = this.removeMask(e.returnvalue);
				this.addElementName(e.returnvalue, BDFDB.LanguageUtils.LanguageStrings.HOME);
			}
			
			processGuildFavorites (e) {
				this.removeTooltip(e.returnvalue);
				e.returnvalue = this.removeMask(e.returnvalue);
				this.addElementName(e.returnvalue, BDFDB.LanguageUtils.LanguageStrings.FAVORITES_GUILD_NAME);
			}
			
			processDirectMessage (e) {
				if (!e.instance.props.channel.id) return;
				if (e.returnvalue.props.children && e.returnvalue.props.children.props) e.returnvalue.props.children.props.className = BDFDB.DOMUtils.formatClassName(e.returnvalue.props.children.props.className, BDFDB.LibraryStores.UserGuildSettingsStore.isChannelMuted(null, e.instance.props.channel.id) && BDFDB.disCN._displayserversaschannelsmuted);
				let text = BDFDB.ReactUtils.findValue(e.returnvalue, "text");
				this.removeTooltip(e.returnvalue);
				e.returnvalue = this.removeMask(e.returnvalue);
				this.addElementName(e.returnvalue, text, {
					isDm: true
				});
			}
			
			processGuildItem (e) {
				if (!e.instance.props.guild) return;
				e.returnvalue.props.className = BDFDB.DOMUtils.formatClassName(e.returnvalue.props.className, BDFDB.LibraryStores.UserGuildSettingsStore.isMuted(e.instance.props.guild.id) && BDFDB.disCN._displayserversaschannelsmuted);
				if (!BDFDB.BDUtils.isPluginEnabled("ServerDetails")) this.removeTooltip(e.returnvalue, e.instance.props.guild);
				e.returnvalue = this.removeMask(e.returnvalue);
				this.addElementName(e.returnvalue, e.instance.props.guild.name, {
					badges: [
						this.settings.general.showGuildIcon && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildIconComponents.Icon, {
							animate: e.instance.props.animatable && e.instance.state && e.instance.state.hovered,
							guild: e.instance.props.guild,
							size: BDFDB.LibraryComponents.GuildIconComponents.Icon.Sizes.SMALLER
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildBadge, {
							size: this.settings.amounts.serverElementHeight * 0.5,
							badgeColor: BDFDB.DiscordConstants.Colors.PRIMARY_400,
							tooltipColor: BDFDB.LibraryComponents.TooltipContainer.Colors.BLACK,
							tooltipPosition: BDFDB.LibraryComponents.TooltipContainer.Positions.RIGHT,
							guild: e.instance.props.guild
						})
					]
				});
			}
			
			processFolderHeader (e) {
				if (!e.instance.props.folderNode) return;
				e.returnvalue = this.removeMask(e.returnvalue, true);
				let folderColor = BDFDB.ColorUtils.convert(e.instance.props.folderNode.color, "HEX") || "var(--bdfdb-blurple)";
				let folderSize = Math.round(this.settings.amounts.serverElementHeight * 0.725);
				let badge = null;
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.guildfoldericonwrapper]]});
				if (index > -1 && children[index] && children[index].props && children[index].props.style && children[index].props.style.background) badge = children[index];
				else {
					[children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "FolderIcon"});
					if (index > -1) children[index] = null;
				}
				this.addElementName(e.returnvalue, e.instance.props.folderNode.name || BDFDB.LanguageUtils.LanguageStrings.SERVER_FOLDER_PLACEHOLDER, {
					wrap: true,
					backgroundColor: e.instance.props.expanded && BDFDB.ColorUtils.setAlpha(folderColor, 0.2),
					badges: badge || BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						color: folderColor,
						width: folderSize,
						height: folderSize,
						name: BDFDB.LibraryComponents.SvgIcon.Names.FOLDER
					})
				});
			}
			
			processFolderItemWrapper (e) {
				if (!e.instance.props.folderNode) return;
				let folderColor = this.settings.general.addFolderColor && BDFDB.LibraryStores.ExpandedGuildFolderStore.isFolderExpanded(e.instance.props.folderNode.id) && BDFDB.ColorUtils.convert(e.instance.props.folderNode.color, "HEX");
				if (folderColor) e.returnvalue = BDFDB.ReactUtils.createElement("div", {
					style: {"--folder-color": folderColor},
					children: e.returnvalue
				});
			}
			
			processCircleIconButton (e) {
				const child = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: n => n.props && n.props.id && typeof n.props.children == "function"});
				let process = returnvalue => {
					this.removeTooltip(returnvalue);
					returnvalue = this.removeMask(returnvalue);
					this.addElementName(e.returnvalue, e.instance.props.tooltip, {
						wrap: true,
						backgroundColor: "transparent"
					});
					return returnvalue;
				};
				if (child) {
					let renderChildren = child.props.children;
					child.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = BDFDB.ReactUtils.createElement(BDFDB.ReactUtils.Fragment, {children: renderChildren(...args)});
						children = process(children);
						return children;
					});
				}
				else e.returnvalue = process(e.returnvalue);
			}
			
			processUnavailableGuildsButton (e) {
				this.removeTooltip(e.returnvalue);
				this.addElementName(e.returnvalue, `${e.instance.props.unavailableGuilds} ${e.instance.props.unavailableGuilds == 1 ? "Server" : "Servers"}`, {
					wrap: true,
					backgroundColor: "transparent"
				});
			}
			
			processTooltipContainer (e) {
				if (!e.instance.props.tooltipClassName || e.instance.props.tooltipClassName.indexOf(BDFDB.disCN.guildlistitemtooltip) == -1) return;
				e.instance.props.shouldShow = false;
			}
			
			removeTooltip (parent, guild) {
				let [children, index] = BDFDB.ReactUtils.findParent(parent, {name: ["ListItemTooltip", "GuildTooltip", "BDFDB_TooltipContainer"]});
				if (index == -1) return;
				if (!guild) children[index] = children[index].props.children;
				else children[index] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildVoiceList, {
						guild: guild
					}),
					tooltipConfig: {
						type: "right"
					},
					children: children[index].props.children
				});
			}
			
			removeMask (parent) {
				let [children, index] = BDFDB.ReactUtils.findParent(parent, {name: "BlobMask"});
				let parentIsMask = index == -1 && parent.type.prototype && parent.type.prototype && typeof parent.type.prototype.getLowerBadgeStyles == "function";
				if (parentIsMask) [children, index] = [[parent], 0];
				if (index > -1) {
					let badges = [];
					for (let key of Object.keys(children[index].props)) {
						if (key && key.endsWith("Badge") && BDFDB.ReactUtils.isValidElement(children[index].props[key])) badges.push(children[index].props[key]);
					}
					if (badges.length) {
						let insertBadges = returnvalue => {
							if (returnvalue.props.children) (returnvalue.props.children[0] || returnvalue.props.children).props.children = [
								(returnvalue.props.children[0] || returnvalue.props.children).props.children,
								badges
							].flat(10).filter(n => n);
							else returnvalue.props.children = [badges];
						};
						if (children[index].props.children && children[index].props.children.props && typeof children[index].props.children.props.children == "function") {
							let childrenRender = children[index].props.children.props.children;
							children[index].props.children.props.children = BDFDB.TimeUtils.suppress((...args) => {
								let renderedChildren = childrenRender(...args);
								insertBadges(renderedChildren);
								return renderedChildren;
							}, "", this);
						}
						else insertBadges(children[index]);
					}
					children[index] = children[index].props.children;
					if (parentIsMask) return children[index];
				}
				return parent;
			}
			
			addElementName (parent, name, options = {}) {
				let [children, index] = BDFDB.ReactUtils.findParent(parent, {
					name: ["NavItem", "Clickable"],
					props: [["className", BDFDB.disCN.guildserrorinner]],
					filter: c => c && c.props && (c.props.id == "home" || !isNaN(parseInt(c.props.id)))
				});
				if (index == -1) return;
				let insertElements = returnvalue => {
					if (BDFDB.ReactUtils.findChild(parent, {props: [["className", BDFDB.disCN._displayserversaschannelsname]]})) return;
					let childEles = [
						[
							options.isDm && returnvalue.props.icon && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Avatars.Avatar, {
								src: returnvalue.props.icon,
								size: BDFDB.LibraryComponents.AvatarConstants.Sizes.SIZE_24
							}),
							options.badges,
						].flat(10).filter(n => n).map(badge => BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._displayserversaschannelsbadge,
							children: badge
						})),
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._displayserversaschannelsname,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
								children: name
							})
						}),
						[returnvalue.props.children].flat(10).filter(n => !(n && (n.type && n.type.displayName ==  "FolderIcon" || n.props && n.props.className && n.props.className.indexOf(BDFDB.disCN.guildfoldericonwrapper) > -1)))
					].flat().filter(n => n);
					delete returnvalue.props.icon;
					delete returnvalue.props.name;
					returnvalue.props.children = options.wrap ? BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.guildiconchildwrapper,
						style: {backgroundColor: options.backgroundColor},
						children: childEles
					}) : childEles;
				};
				if (typeof children[index].props.children == "function") {
					let childrenRender = children[index].props.children;
					children[index].props.children = BDFDB.TimeUtils.suppress((...args) => {
						let renderedChildren = childrenRender(...args);
						insertElements(renderedChildren);
						return renderedChildren;
					}, "", this);
				}
				else insertElements(children[index]);
			}

			addCSS () {
				BDFDB.DOMUtils.appendLocalStyle("DSACStyle" + this.name, `
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper + BDFDB.notCN.guildswrapperhidden}:not(._closed),
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildsscroller},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildswrapperunreadmentionsbartop},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildswrapperunreadmentionsbarbottom} {
						width: ${this.settings.amounts.serverListWidth}px;
					}
					
					${BDFDB.dotCNS.themedark + BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildsscroller}::-webkit-scrollbar-thumb,
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper + BDFDB.dotCNS.themedark + BDFDB.dotCN.guildsscroller}::-webkit-scrollbar-thumb {
						background-color: ${BDFDB.DiscordConstants.Colors.PRIMARY_800};
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter} {
						width: auto;
						display: flex;
						justify-content: flex-start;
						margin-left: 8px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildinnerwrapper},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildinner} {
						width: ${this.settings.amounts.serverListWidth - 20}px;
						height: ${this.settings.amounts.serverElementHeight}px;
						border-radius: 4px !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildsscroller} > div[style*="transform"][style*="height"] {
						height: unset !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildpillwrapper} {
						top: ${-1 * (48 - this.settings.amounts.serverElementHeight) / 2}px;
						left: -8px;
						transform: scaleY(calc(${this.settings.amounts.serverElementHeight}/48));
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildiconchildwrapper} {
						width: ${this.settings.amounts.serverListWidth - 20}px;
						height: ${this.settings.amounts.serverElementHeight}px;
						padding: 0 8px;
						box-sizing: border-box;
						cursor: pointer;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN._displayserversaschannelsname} {
						flex: 1 1 auto;
						font-size: ${this.settings.amounts.serverElementHeight / 2}px;
						font-weight: 500;
						padding-top: 1px;
						overflow: hidden;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS._displayserversaschannelsmuted + BDFDB.dotCN._displayserversaschannelsname} {
						opacity: 0.6;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN._displayserversaschannelsbadge}:not(:empty) {
						display: flex;
						margin-right: 4px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCNS._displayserversaschannelsbadge + BDFDB.dotCN.avataricon} {
						width: ${this.settings.amounts.serverElementHeight/32 * 24}px;
						height: ${this.settings.amounts.serverElementHeight/32 * 24}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN.badgebase} {
						margin-left: 4px;
						border-radius: ${this.settings.amounts.serverElementHeight/32 * 8}px;
						width: ${this.settings.amounts.serverElementHeight/32 * 16}px;
						height: ${this.settings.amounts.serverElementHeight/32 * 16}px;
						font-size: ${this.settings.amounts.serverElementHeight/32 * 12}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN.badgebase}[style*="width: 16px;"] {
						width: ${this.settings.amounts.serverElementHeight/32 * 16}px !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN.badgebase}[style*="width: 22px;"] {
						width: ${this.settings.amounts.serverElementHeight/32 * 22}px !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN.badgebase}[style*="width: 30px;"] {
						width: ${this.settings.amounts.serverElementHeight/32 * 30}px !important;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.homebuttonicon} {
						width: ${this.settings.amounts.serverElementHeight/32 * 28}px;
						height: ${this.settings.amounts.serverElementHeight/32 * 20}px;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.avatarwrapper} {
						width: ${this.settings.amounts.serverElementHeight/32 * 24}px !important;
						height: ${this.settings.amounts.serverElementHeight/32 * 24}px !important;
					}
					
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildseparator} {
						width: ${this.settings.amounts.serverListWidth - 20}px;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildiconwrapper} {
						height: ${this.settings.amounts.serverElementHeight}px;
						width: ${this.settings.amounts.serverListWidth - 20}px;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolderwrapper} {
						width: auto;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolder} {
						display: flex;
						align-items: center;
						height: ${this.settings.amounts.serverElementHeight}px;
						width: ${this.settings.amounts.serverListWidth - 20}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolder}[data-folder-name]::after {
						content: attr(data-folder-name);
						display: flex;
						justify-content: flex-start;
						align-items: center;
						font-size: ${this.settings.amounts.serverElementHeight / 2}px;
						font-weight: 500;
						text-transform: capitalize;
						padding-top: 1px;
						padding-left: 3px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfoldericonwrapper}[style*="background"] {
						margin-left: ${Math.round(this.settings.amounts.serverElementHeight * -0.15)}px;
						background-position-x: ${Math.round(this.settings.amounts.serverElementHeight * 0.75) / 10}px !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolder} > ${BDFDB.dotCN.guildfoldericonwrapper} {
						margin-left: 6px;
						background-size: ${Math.round(this.settings.amounts.serverElementHeight * 0.85)}px ${Math.round(this.settings.amounts.serverElementHeight * 0.85)}px !important;
						background-position: center center !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfoldericonwrapper},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfoldericonwrapperexpanded} {
						height: ${Math.round(this.settings.amounts.serverElementHeight * 0.85)}px;
						width: ${Math.round(this.settings.amounts.serverElementHeight * 0.85)}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolderexpandedbackground} {
						top: -2px;
						right: 2px;
						bottom: -2px;
						left: 6px;
						width: auto;
						border-radius: 4px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolderwrapper} [role="group"] {
						height: auto !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolderwrapper} [role="group"] > ${BDFDB.dotCN.guildouter}:last-child {
						margin-bottom: 10px;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildbuttoninner} {
						height: ${this.settings.amounts.serverElementHeight}px;
						width: ${this.settings.amounts.serverListWidth - 20}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildbuttoninner} svg {
						width: ${this.settings.amounts.serverElementHeight/32 * 20}px;
						height: ${this.settings.amounts.serverElementHeight/32 * 20}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildbuttoninner + BDFDB.dotCN._displayserversaschannelsname} {
						padding-top: 0;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildserror} {
						height: ${this.settings.amounts.serverElementHeight}px;
						width: ${this.settings.amounts.serverListWidth - 20}px;
						font-size: ${this.settings.amounts.serverElementHeight/32 * 20}px;
						border: none;
						display: block;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildserror + BDFDB.dotCN.guildiconchildwrapper} {
						padding-right: ${this.settings.amounts.serverElementHeight/32 * 16 + (32/this.settings.amounts.serverElementHeight - 1) * 4}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildserror + BDFDB.dotCN._displayserversaschannelsname} {
						padding-top: 0;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._readallnotificationsbuttonframe},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._readallnotificationsbuttoninner},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._readallnotificationsbuttonbutton} {
						height: ${this.settings.amounts.serverElementHeight}px !important;
						width: ${this.settings.amounts.serverListWidth - 20}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._friendnotificationsfriendsonline},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildslabel} {
						height: ${this.settings.amounts.serverElementHeight * 0.6}px !important;
						width: ${this.settings.amounts.serverListWidth - 20}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._readallnotificationsbuttonbutton},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._friendnotificationsfriendsonline},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildslabel} {
						display: flex;
						justify-content: flex-start;
						align-items: center;
						font-size: ${this.settings.amounts.serverElementHeight / 2}px;
						font-weight: 500;
						text-transform: capitalize;
						padding-top: 1px;
						padding-left: 8px;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildplaceholdermask},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildiconwrapper},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolder},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildbuttoninner},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildserror} {
						border-radius: 4px;
						overflow: hidden;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildplaceholdermask},
						background-color: var(--background-primary);
						border-radius: 4px;
						height: ${this.settings.amounts.serverElementHeight}px;
						width: ${this.settings.amounts.serverListWidth}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildplaceholdermask} > *,
						display: none;
					}

					${BDFDB.dotCN._displayserversaschannelsstyled} .typingindicator-guild,
					${BDFDB.dotCN._displayserversaschannelsstyled} .typingindicator-dms,
					${BDFDB.dotCN._displayserversaschannelsstyled} .typingindicator-folder {
						position: static !important;
						margin-left: -34px !important;
						padding-left: 6px !important;
						box-shadow: unset !important;
						background: var(--background-primary) !important;
						z-index: 1 !important;
					}
					
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper} #server-search ${BDFDB.dotCN.guildinner}::before {
						content: "Server Search";
						color: var(--text-normal);
						display: flex;
						align-items: center;
						height: ${this.settings.amounts.serverElementHeight}px;
						font-size: ${this.settings.amounts.serverElementHeight / 2}px;
						font-weight: 500;
						padding-left: 8px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper} #server-search ${BDFDB.dotCN.guildinner}::after {
						content: "";
						position: absolute;
						top: ${this.settings.amounts.serverElementHeight/32 * 6}px;
						right: 7px;
						width: ${this.settings.amounts.serverElementHeight/32 * 20}px;
						height: ${this.settings.amounts.serverElementHeight/32 * 20}px;
						background: var(--text-normal);
						-webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAxOCAxOCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTMuNjAwOTE0ODEsNy4yMDI5NzMxMyBDMy42MDA5MTQ4MSw1LjIwOTgzNDE5IDUuMjA5ODM0MTksMy42MDA5MTQ4MSA3LjIwMjk3MzEzLDMuNjAwOTE0ODEgQzkuMTk2MTEyMDYsMy42MDA5MTQ4MSAxMC44MDUwMzE0LDUuMjA5ODM0MTkgMTAuODA1MDMxNCw3LjIwMjk3MzEzIEMxMC44MDUwMzE0LDkuMTk2MTEyMDYgOS4xOTYxMTIwNiwxMC44MDUwMzE0IDcuMjAyOTczMTMsMTAuODA1MDMxNCBDNS4yMDk4MzQxOSwxMC44MDUwMzE0IDMuNjAwOTE0ODEsOS4xOTYxMTIwNiAzLjYwMDkxNDgxLDcuMjAyOTczMTMgWiBNMTIuMDA1NzE3NiwxMC44MDUwMzE0IEwxMS4zNzMzNTYyLDEwLjgwNTAzMTQgTDExLjE0OTIyODEsMTAuNTg4OTA3OSBDMTEuOTMzNjc2NCw5LjY3NjM4NjUxIDEyLjQwNTk0NjMsOC40OTE3MDk1NSAxMi40MDU5NDYzLDcuMjAyOTczMTMgQzEyLjQwNTk0NjMsNC4zMjkzMzEwNSAxMC4wNzY2MTUyLDIgNy4yMDI5NzMxMywyIEM0LjMyOTMzMTA1LDIgMiw0LjMyOTMzMTA1IDIsNy4yMDI5NzMxMyBDMiwxMC4wNzY2MTUyIDQuMzI5MzMxMDUsMTIuNDA1OTQ2MyA3LjIwMjk3MzEzLDEyLjQwNTk0NjMgQzguNDkxNzA5NTUsMTIuNDA1OTQ2MyA5LjY3NjM4NjUxLDExLjkzMzY3NjQgMTAuNTg4OTA3OSwxMS4xNDkyMjgxIEwxMC44MDUwMzE0LDExLjM3MzM1NjIgTDEwLjgwNTAzMTQsMTIuMDA1NzE3NiBMMTQuODA3MzE4NSwxNiBMMTYsMTQuODA3MzE4NSBMMTIuMjEwMjUzOCwxMS4wMDk5Nzc2IEwxMi4wMDU3MTc2LDEwLjgwNTAzMTQgWiI+PC9wYXRoPjwvZz48L3N2Zz4=') center/cover no-repeat;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper} #server-search ${BDFDB.dotCN.guildbuttonpill},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper} #server-search ${BDFDB.dotCN.guildsvg} {
						display: none;
					}`);
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
