import config from "config";

export const getFileLinkFromLink = (fileLink: string) => {
  if (
    !fileLink.startsWith("/") &&
    !fileLink.startsWith("http://") &&
    !fileLink.startsWith("https://")
  ) {
    const selfURL = config.get<string>("SELF_URL") || "http://localhost";
    return `${selfURL}/file/${fileLink}`;
  }
  return fileLink;
};
