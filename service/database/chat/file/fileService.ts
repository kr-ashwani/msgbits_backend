import config from "config";
import { fileDAO } from "../../../../Dao/FileDAO";
import { FileRowMapper } from "../../../../Dao/RowMapper/FileRowMapper";
import { IFile } from "../../../../model/file.model";
import { FileDTO } from "../../../../schema/chat/FileDTOSchema";

class FileService {
  async createFile(fileDTO: FileDTO) {
    try {
      const file = this.convertDTOToIFile(fileDTO);

      const fileArr: IFile[] = [];
      await fileDAO.create(
        file,
        new FileRowMapper((file) => {
          fileArr.push(file.toObject());
        })
      );

      return fileArr.length ? this.convertIFileToDTO(fileArr[0]) : null;
    } catch (err) {
      throw err;
    }
  }
  async getFileById(fileId: string): Promise<FileDTO | null> {
    try {
      const fileArr: IFile[] = [];

      await fileDAO.find(
        {
          fileId,
        },
        new FileRowMapper((file) => {
          fileArr.push(file.toObject());
        })
      );

      return fileArr.length ? this.convertIFileToDTO(fileArr[0]) : null;
    } catch (err) {
      throw err;
    }
  }

  //function overloads
  convertIFileToDTO(file: IFile): FileDTO;
  convertIFileToDTO(file: IFile[]): FileDTO[];

  //function implementations
  convertIFileToDTO(file: IFile | IFile[]): FileDTO | FileDTO[] {
    if (Array.isArray(file)) {
      return file.map(this.convertSingleFileToDTO);
    } else {
      return this.convertSingleFileToDTO(file);
    }
  }
  private convertSingleFileToDTO(file: IFile): FileDTO {
    return file;
  }

  convertDTOToIFile(file: FileDTO): IFile {
    return file;
  }
}

const fileService = new FileService();
export { fileService };
