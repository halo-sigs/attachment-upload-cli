# Halo Attachment Upload CLI

<p>
<a href="https://www.npmjs.com/package/@halo-dev/attachment-upload-cli" target="__blank"><img alt="npm" src="https://img.shields.io/npm/v/@halo-dev/attachment-upload-cli?style=flat-square"></a>
<a href="https://www.npmjs.com/package/@halo-dev/attachment-upload-cli" target="__blank"><img alt="npm" src="https://img.shields.io/npm/dm/@halo-dev/attachment-upload-cli?style=flat-square"></a>
</p>

> 在 Terminal 中上传文件到 Halo 并得到链接，兼容 Typora 编辑器的图片上传。

[![asciicast](https://asciinema.org/a/NVnIamnx3WrQNnDSOHKLDqDic.svg)](https://asciinema.org/a/NVnIamnx3WrQNnDSOHKLDqDic)

## 安装

```bash
npm install @halo-dev/attachment-upload-cli -g
```

安装完成之后，就可以在 Terminal 中使用 `halo-attachment-upload` 命令，或者 `hau`，以下使用 `hau` 为例。

## 配置

```bash
hau setup
```

## 上传文件

```bash
hau -f /path/to/file
```

## 在 Typora 中使用

1. 找到 Node 和 hau 的实际路径

    ```bash
    which node
    which hau

    # 以下为例子
    /opt/homebrew/opt/node@18/bin/node
    /opt/homebrew/bin/hau
    ```

2. 拼接上传命令

    ```bash
    /opt/homebrew/opt/node@18/bin/node /opt/homebrew/bin/hau upload -f
    ```

3. 打开 Typora 设置，进入 **图像 -> 上传服务设定**，将上传服务改为自定义命令，并将上面拼接的命令填入即可。

## 帮助

```bash
❯ hau --help
Usage: halo-attachment-upload|hau [options] [command]

Options:
  -V, --version       output the version number
  -h, --help          display help for command

Commands:
  upload|u [options]  Upload a file to Halo
  setup|s             Setup your Halo site url, username and password
  help [command]      display help for command
```
