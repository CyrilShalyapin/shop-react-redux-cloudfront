import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";
import { Buffer } from "buffer";

type CSVFileImportProps = {
  url: string;
  title: string;
};

function getAuthToken(): string | null {
  const token = localStorage.getItem("authorization_token");

  if (!token) {
    localStorage.setItem(
      "authorization_token",
      "Basic " + Buffer.from("CyrilShalyapin:TEST_PASSWORD").toString("base64")
    );
  }

  return token;
}

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);

    // Get the presigned URL
    if (file) {
      const authToken = getAuthToken();
      const response = await axios({
        method: "GET",
        url,
        params: {
          name: encodeURIComponent(file.name),
        },
        headers: authToken
          ? {
              Authorization: authToken,
            }
          : undefined,
      });
      console.log("File to upload: ", file.name);
      console.log("Uploading to: ", response.data);
      const result = await fetch(response.data, {
        method: "POST",
        body: file,
        headers: {
          "x-amz-acl": "public-read",
        },
      });
      console.log("Result: ", result);
      setFile(undefined);
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
