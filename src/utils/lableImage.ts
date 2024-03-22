// 图片数据
export interface ImageData {
  name: string;
  value: FileSystemFileHandle;
  url: string;
}
// 标签分类数据
export interface Label {
  id: number;
  name: string;
  color: string;
}
// 标签的具体数据
export interface LabelData {
  id: string; // 唯一id
  name: string; // 名称
  cid: number; // class id
  color: string; // 颜色
  x: number;
  y: number;
  width: number;
  height: number;
}
interface FileIoParams {
  ImageDirHandle: FileSystemDirectoryHandle;
  OutputDirHandle: FileSystemDirectoryHandle;
}
export class FileIo {
  ImageDirHandle: FileSystemDirectoryHandle;
  OutputDirHandle: FileSystemDirectoryHandle;
  imagesData = new Array<ImageData>();
  index = 0;
  constructor(param: FileIoParams) {
    let { ImageDirHandle, OutputDirHandle } = param;
    this.ImageDirHandle = ImageDirHandle;
    this.OutputDirHandle = OutputDirHandle;
  }
  async initImages() {
    const { ImageDirHandle, imagesData } = this;
    //@ts-ignore
    for await (const [key, value] of ImageDirHandle.entries()) {
      // 忽略非图片文件
      if (!value.name.match(/\.(jpg|jpeg|png|gif)$/)) continue;
      const file = await value.getFile();
      const url = URL.createObjectURL(file);
      imagesData.push({ name: key, value, url });
    }
  }

  setIndex(index: number) {
    if (index < 0 || index >= this.imagesData.length)
      throw new Error("index out of range");
    this.index = index;
  }

  /**
   * 写入文件
   * @param {string} name 文件名
   * @param {string} content 文件内容
   */
  async saveFile(name: string, content: string) {
    const { OutputDirHandle } = this;
    const fileHandle = await OutputDirHandle.getFileHandle(name, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async readFile(name: string) {
    try {
      const { OutputDirHandle } = this;
      if (!OutputDirHandle) {
        console.error("OutputDirHandle is not initialized.");
        return undefined;
      }
      const fileHandle = await OutputDirHandle.getFileHandle(name);
      const file = await fileHandle.getFile();
      const text = await file.text();
      return text;
    } catch (error) {
      return undefined;
    }
  }

  get nextImage() {
    const { imagesData, index } = this;
    const _index = index + 1;
    if (_index >= imagesData.length) {
      return imagesData[0];
    }
    this.index = _index;
    return imagesData[_index];
  }
  get prevImage() {
    const { imagesData, index } = this;
    const _index = index - 1;
    if (_index < 0) {
      return imagesData[imagesData.length - 1];
    }
    this.index = _index;
    return imagesData[_index];
  }

  get currentImage() {
    return this.imagesData[this.index];
  }
}
