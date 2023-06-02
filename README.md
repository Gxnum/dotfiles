# Intro
This repo contains my dotfiles for my rice. If you want to replicate my desktop, you ought to follow the guide.

Tiling mode:
![image](https://github.com/Gxnum/dotfiles/assets/65645307/8d90edcb-27a6-42b6-892b-6cd2c69e96b4)
Floating mode:
![image](https://github.com/Gxnum/dotfiles/assets/65645307/267408ba-3389-4372-aea7-d51b9a151c5c)
Desktop:
![image](https://github.com/Gxnum/dotfiles/assets/65645307/e39d3d98-9d28-4486-b31e-f46834e200ac)

## What I use
- OS: [Arco linux](https://www.arcolinuxd.com/hyprland/) ([bedrock linux](https://bedrocklinux.org/) now)
- Screenshots: [grimblast](https://github.com/hyprwm/contrib#grimblast)
- Terminal: [alacritty](https://alacritty.org/)
- Shell: [oh-my-zsh](https://ohmyz.sh/)
- oh-my-zsh theme: [powerlevel10k](https://github.com/romkatv/powerlevel10k)
- Browser: [vivaldi](https://vivaldi.com)
- Wayland Compositor: [Hyprland](https://hyprland.org/)
- Editor: [Neovim](https://neovim.io/) ([AstroNvim](https://astronvim.com/))
- GTK+ and Qt theme: [Orchis](https://github.com/vinceliuice/Orchis-theme) [Dark](https://github.com/vinceliuice/Orchis-kde)
- Icon theme: [ArcoLinux Candy Beauty](https://github.com/arcolinux/arcolinux-candy-beauty)
- Mouse cursor: [Bibata-Modern-Ice](https://www.gnome-look.org/p/1914825/)

# Installation guide
## Installing bedrock linux (optional)
Assuming you want the AUR in your system, despite it not being an arch-based distro, or not having pacman:
```bash
wget https://github.com/bedrocklinux/bedrocklinux-userland/releases/download/0.7.28/bedrock-linux-0.7.28-x86_64.sh
sh bedrock-linux-0.7.28-x86_64.sh --hijack
```
After doing so, you are ought to follow bedrock's instructions and in the end reboot your system.
Now that you have rebooted your system, all you need to do is fetch pacman from arch linux:
```bash
brl fetch arch
sudo pacman -Syyuv
```
## Cloning this github repo
There is only one little step into cloning my configurations to your device:
```bash
cd ~/
git clone https://github.com/Gxnum/dotfiles/

```
## Installing AUR helper yay (optional)
Of course, you can install any other AUR helper, but I recommend yay:
```bash
sudo pacman -S
cd /opt
sudo git clone https://aur.archlinux.org/yay-git.git
sudo chown -R USER:USER ./yay-git
cd yay-git
makepkg -si`
```
## Installing dependencies (yay)
If you are using a different AUR helper, just change `yay -S` with your AUR helper and it's install flag
```bash
yay -S hyprland mako neovim bashtop pulseaudio orchis-kde-theme-git orchis-theme-git arcolinux-candy-beauty-git bibata-cursor-theme-bin ttf-jetbrains-mono-nerd neofetch waybar pavucontrol fzf mpv libqalculate alacritty grimblast-git grim swaybg swayidle ly zsh dolphin pamixer ttf-ms-fonts ttf-apple-emoji kvantum-qt5-git kvantum-qt6-git lxappearance qt5ct rofi ttf-jetbrains-mono btop
```
## Installing Oh-My-Zsh
"Oh-My-Zsh is a delightful, open source, community-driven framework for managing your Zsh configuration. It comes bundled with thousands of helpful functions, helpers, plugins and themes"
```bash
sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
```
## Installing Powerlevel10k zsh
"Powerlevel10k is a theme for Zsh. It emphasizes speed, flexibility and out-of-the-box experience."
```bash
yay -S --noconfirm zsh-theme-powerlevel10k-git ttf-meslo-nerd-font-powerlevel10k
echo 'source /usr/share/zsh-theme-powerlevel10k/powerlevel10k.zsh-theme' >>~/.zshrc
```
Afterwards, create or open ~/.config/alacritty/alacritty.yml and add the following section to it:
```yaml
font:
  normal:
    family: "MesloLGS NF"
```
then reload Alacritty or type `zsh`
## Installing AstroNvim
"AstroNvim is an aesthetic and feature-rich neovim config that is extensible and easy to use with a great set of plugins"
```bash
git clone --depth 1 https://github.com/AstroNvim/AstroNvim ~/.config/nvim
```
