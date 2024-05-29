import { Response } from "express";

interface ClientResponseSchema {
  success: boolean;
  message: string;
  data: any;
}

class ClientResponse {
  private res: Response | null = null;
  private resObject: ClientResponseSchema = this.init();

  constructor() {
    this.init();
  }
  private init() {
    this.res = null;
    this.resObject = {
      success: false,
      message: "",
      data: null,
    };
    return this.resObject;
  }
  private setResObjSuccessfull() {
    this.resObject.success = true;
  }
  setMessage(msg: string) {
    this.resObject.message = msg;
    return this;
  }

  setData(data: any) {
    this.resObject.data = data;
    return this;
  }

  send() {
    this.res?.json(this.resObject);
    this.init();
  }

  setRes(res: Response) {
    this.init();
    this.res = res;
    return this;
  }

  setStatus(status: number) {
    this.res?.status(status);
    if (status >= 200 && status < 300) this.setResObjSuccessfull();
    return this;
  }
}

export const clientRes = new ClientResponse();
