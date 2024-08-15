<!--
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2024-08-12 17:30:05
 * @LastEditors: houqiangxie
 * @LastEditTime: 2024-08-12 17:30:21
-->
npx electron-packager . enterprise --platform=win32 --arch=x64 --out=dist --overwrite
. 表示当前目录。
enterprise 是应用程序的名称。
--platform=win32 表示目标平台为 Windows。
--arch=x64 表示目标架构为 64 位。
--out=dist 表示输出目录为 dist 文件夹。
--overwrite 表示如果输出目录已存在则覆盖。