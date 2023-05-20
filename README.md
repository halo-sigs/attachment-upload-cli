# Halo Attachment Upload CLI

> 在 Terminal 中上传文件到 Halo 并得到链接，兼容 Typora 编辑器的图片上传。

## 安装

```bash
npm install @halo-dev/attachment-upload-cli -g

#or 

pnpm install @halo-dev/attachment-upload-cli -g
```

安装完成之后，就可以在 Terminal 中使用 `halo-attachment-upload` 命令，或者 `hau`。

## 配置

```bash
hau setup

#or

halo-attachment-upload setup
```

## 上传文件

```bash
hau -f /path/to/file

#or

halo-attachment-upload -f /path/to/file
```

## 帮助

```bash
❯ hau --help
Usage: @halo-dev/attachment-upload-cli [options] [command]

Options:
  -V, --version       output the version number
  -h, --help          display help for command

Commands:
  upload|u [options]  Upload a file to Halo
  setup|s             Setup your Halo site url, username and password
  help [command]      display help for command
```
