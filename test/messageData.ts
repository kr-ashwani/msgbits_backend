type ITextMessage = {
  createdAt: string;
  updatedAt: string;
  message: string;
  type: "text";
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  messageId: string;
  senderId: string;
  chatRoomId: string;
  repliedTo: string | null;
};

export const message: ITextMessage[] = [
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-08-17T21:41:16.978Z",
    message: "jhsc slbhvdlsbvbh vlwhvobv",
    type: "text",
    status: "read",
    messageId: "msg1",
    senderId: "66891937f4f39db4481b8e02",
    repliedTo: null,
    chatRoomId: "chatroom1",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message: "sdvskvbdlvu iljbjsvibviuv slibdvobv",
    type: "text",
    status: "read",
    messageId: "msg3",
    senderId: "chatuser2",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message:
      "vbdflahvlahvbouyv wdviubowgvo8uyvgouv wvbowhbvouwgbv wlbvowbvoywbgv wbjivpiwbvouwgeov8wueg  v woibvcoywegvow8yegvo",
    type: "text",
    status: "read",
    messageId: "msg2",
    senderId: "66891937f4f39db4481b8e02",
    repliedTo: null,
    chatRoomId: "chatroom1",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message:
      "ijeguhe huivoiuhwouigvo viubvoibwoviubwov wbvowbvowbv wbvowibveowiebvobwoeef wbfhwbfehb",
    type: "text",
    status: "read",
    messageId: "msg4",
    senderId: "66891937f4f39db4481b8e02",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message: "poko;i jvlhblvhb jbvlhwbvhlwbv wbwbvfohwbfowf wijfewejfbwjefb wjbfjwiebefiwebfiu",
    type: "text",
    status: "read",
    messageId: "msg5",
    senderId: "66891937f4f39db4481b8e02",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message: "hbh jbdlblvjbelvr svjwv blwjvblw vwvj wjvlwjevj",
    type: "text",
    status: "read",
    messageId: "msg6",
    senderId: "chatuser3",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message:
      "ouhiubb  v lhwv ljhwv lwhv lw bvlhwbvlhwbevlhwjvblw wvbwlvblwjvblwvblwhve wejbvlwbvlhiwevbhlewv weejvwlve lwhevblwehvblewhvbvhwevbhwevbhewvbhwev weev hwev lwhevwhevlwehvlhwevbwe",
    type: "text",
    status: "read",
    messageId: "msg7",
    senderId: "chatuser3",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message:
      "scwvkjnwvk wnijvljwbvlwhbvhewbv wbvlhwbvlwhebvwhev wvblwvblwbevlhwevblhwev weevhjblwhveblwevblwevwlevweev weivbbwevibwevwebv  vwibwlievbweivbiwev  weevhjblwhveblwevblwevwlevweevwevb",
    type: "text",
    status: "read",
    messageId: "msg8",
    senderId: "66891937f4f39db4481b8e02",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message:
      "vwvuuwvgouwvb iuwhvciwbvouw v we  hehvbouw  hbvouwvebouwev wevbuhuw oehvubowuehvbow ev bouwevhouw evow  ev webouhvwo  uhvebouwhvbouw  v whuvhw  vbohw bouwevhouwwff wub efo wbwbvfohwbfowfwuyefo  wuef uw fbeo  uwef",
    type: "text",
    status: "read",
    messageId: "msg9",
    senderId: "chatuser3",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message:
      "tfv chs dvkhsvkvd bwvhwvbuhwevowhevwehv vw vw vkhwv hwvhwevvwvew  vbow  evhbo wuev webouhvwofbeohu  wbwbvfohwbfowfwfe wefbhbw hebfuhw ef w  efhbhou webouhvwofbeohuuwhefho  wef",
    type: "text",
    status: "read",
    messageId: "msg10",
    senderId: "66891937f4f39db4481b8e02",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message: "lgvluy vouyvgoutyfvtif uvciyktcviyftiyft gctyviyktityi",
    type: "text",
    status: "read",
    messageId: "msg11",
    senderId: "chatuser2",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message:
      ";oubh;iugbipu ipyi8gb8yugo79yf9t9 iygtcutfrcur5ey7 cutfrcyuxrcye cutrtufcu5rc75er crcu7ry5rc6ec vitvi8t8i6",
    type: "text",
    status: "read",
    messageId: "msg12",
    senderId: "chatuser4",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message:
      "ugkytfit gvkygviytcutr fcutfxyrexze4 uctftututyryresx  iygviytcfuitrdur yitciytcdutrdcuthiuh ygttcfiytdcut",
    type: "text",
    status: "read",
    messageId: "msg13",
    senderId: "chatuser5",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message:
      "hgvhkgckj kgcjftcutrdt crfrtujtrxet fcjturfcxutderxc ciytutrurru ciytcutrurtv c yciytrdu6rd ciytcityf",
    type: "text",
    status: "read",
    messageId: "msg14",
    senderId: "chatuser3",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message: ",gvkhgvkg hggvkgyciytc ugvgiyktcfviytycfd c u tfxyxressetwaw",
    type: "text",
    status: "read",
    messageId: "msg15",
    senderId: "66891937f4f39db4481b8e02",
    repliedTo: null,
    chatRoomId: "chatroom11",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message: "kgfkyt kuhuvkuyygfviyofviotf guylvbouyfgvo7yfv7 oygbvouygo7y hvbkouyvioytcviyotcfv",
    type: "text",
    status: "read",
    messageId: "msg16",
    senderId: "chatuser1",
    repliedTo: null,
    chatRoomId: "chatroom1",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message: ",jhvgkug lhghgbluhbv blluybgoluyfgvit7dfu6rdhgv  yttcutrutr",
    type: "text",
    status: "read",
    messageId: "msg17",
    senderId: "chatuser2",
    repliedTo: null,
    chatRoomId: "chatroom1",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message: "hcjgfc hgcgfjgfxhrxyrsecfuxx cftfhdx tfjtcxhtfdx",
    type: "text",
    status: "read",
    messageId: "msg18",
    senderId: "66891937f4f39db4481b8e02",
    repliedTo: null,
    chatRoomId: "chatroom1",
  },
  {
    createdAt: "2024-07-06T10:15:19.544Z",
    updatedAt: "2024-07-06T10:15:19.544Z",
    message:
      "j,hvhkghjvhkgvh jvhjkgjhvkgcvk vykgcviykgcviyfcuitf cicyciytcutrcutrc yfcjuftcutjrdcu",
    type: "text",
    status: "read",
    messageId: "msg19",
    senderId: "chatuser2",
    repliedTo: null,
    chatRoomId: "chatroom1",
  },
];
