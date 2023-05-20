#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import FormData from "form-data";
import type { AxiosProgressEvent } from "axios";
import cliProgress from "cli-progress";
import apiClient from "./utils/api-client";
import Configstore from "configstore";
import prompts from "prompts";

const config = new Configstore("halo-attachment-upload-cli", {}, { globalConfigPath: true });

const program = new Command();

program.name("@halo-dev/attachment-upload-cli").version("0.1.0");

program
  .command("upload")
  .description("Upload a file to Halo")
  .alias("u")
  .requiredOption("-f, --file <path>", "Specify an input file")
  .action(async (str) => {
    const file = fs.createReadStream(str.file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("policyName", "default-policy");

    const processBar = new cliProgress.SingleBar(
      {
        format: "Uploading [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
      },
      cliProgress.Presets.legacy
    );

    processBar.start(100, 0);

    const { data } = await apiClient.post(`/apis/api.console.halo.run/v1alpha1/attachments/upload`, formData, {
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        const process = parseInt(Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1)) + "");
        processBar.update(process);
      },
    });

    processBar.stop();
    console.log("Upload Success:");
    console.log(await getAttachmentPermalink(data.metadata.name));
  });

program
  .command("setup")
  .alias("s")
  .description("Setup your Halo site url, username and password")
  .action(async () => {
    const { site_url } = await prompts({
      type: "text",
      name: "site_url",
      message: "Please input your site url",
    });
    config.set("site_url", site_url);

    const { username } = await prompts({
      type: "text",
      name: "username",
      message: "Please input your username",
    });
    config.set("username", username);

    const { password } = await prompts({
      type: "password",
      name: "password",
      message: "Please input your password",
    });
    config.set("password", password);
  });

program.parse(process.argv);

const getAttachmentPermalink = (name: string) => {
  return new Promise((resolve, reject) => {
    const fetchPermalink = () => {
      apiClient
        .get(`/apis/storage.halo.run/v1alpha1/attachments/${name}`)
        .then((response) => {
          const permalink = response.data.status.permalink;
          if (permalink) {
            resolve(`${config.get("site_url")}${permalink}`);
          } else {
            setTimeout(fetchPermalink, 1000);
          }
        })
        .catch((error) => reject(error));
    };
    fetchPermalink();
  });
};
