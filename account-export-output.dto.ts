import internal from 'stream';

export default interface AccountExportOutputDto {
  fileName: string;
  stream: internal.PassThrough;
}
