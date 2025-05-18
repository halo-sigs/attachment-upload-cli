#!/usr/bin/env node

import fs from "node:fs";
import type { Group, GroupList, Policy, PolicyList } from "@halo-dev/api-client";
import type { AxiosProgressEvent } from "axios";
import axios from "axios";
import cliProgress from "cli-progress";
import { Command } from "commander";
import Configstore from "configstore";
import FormData from "form-data";
import prompts from "prompts";
import { version } from "../package.json";
import apiClient from "./utils/api-client";

const config = new Configstore("@halo-dev/attachment-upload-cli", {}, { globalConfigPath: true });

const program = new Command();

program.name("halo-attachment-upload").alias("hau").version(version);

program
  .command("upload")
  .description("Upload a file to Halo")
  .alias("u")
  .requiredOption("-f, --file <path>", "Specify an input file")
  .action(async (str) => {
    const file = fs.createReadStream(str.file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("policyName", config.get("policyName"));
    formData.append("groupName", config.get("groupName"));

    const processBar = new cliProgress.SingleBar(
      {
        format: "Uploading [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
      },
      cliProgress.Presets.legacy,
    );

    processBar.start(100, 0);

    const { data } = await apiClient.post("/apis/api.console.halo.run/v1alpha1/attachments/upload", formData, {
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        const process = Number.parseInt(`${Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))}`);
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
  .description("Setup your Halo site url and personal access token")
  .action(async () => {
    try {
      const { siteUrl, pat } = await prompts([
        {
          type: "text",
          name: "siteUrl",
          message: "Please input your site url",
          validate: (value) => {
            if (!value) {
              return "Site url is required";
            }
            if (!value.startsWith("http")) {
              return "Site url must start with http:// or https://";
            }
            return true;
          },
        },
        {
          type: "password",
          name: "pat",
          message: "Please input your personal access token(Attachment Manage Permission)",
          validate: (value) => {
            if (!value) {
              return "Personal access token is required";
            }
            return true;
          },
        },
      ]);

      // fetch attachment policies and groups
      const { data: policies } = await axios.get<PolicyList>(`${siteUrl}/apis/storage.halo.run/v1alpha1/policies`, {
        headers: {
          Authorization: `Bearer ${pat}`,
        },
      });
      const { data: groups } = await axios.get<GroupList>(`${siteUrl}/apis/storage.halo.run/v1alpha1/groups`, {
        headers: {
          Authorization: `Bearer ${pat}`,
        },
      });

      const { policyName, groupName } = await prompts([
        {
          type: "select",
          name: "policyName",
          message: "Please select storage policy",
          choices: policies.items.map((item: Policy) => ({ title: item.spec.displayName, value: item.metadata.name })),
        },
        {
          type: "select",
          name: "groupName",
          message: "Please select storage group",
          choices: [
            { title: "Ungrouped", value: "" },
            ...groups.items.map((item: Group) => ({ title: item.spec.displayName, value: item.metadata.name })),
          ],
        },
      ]);

      config.set("siteUrl", siteUrl);
      config.set("pat", pat);
      config.set("policyName", policyName);
      config.set("groupName", groupName);

      console.log("Setup Success");
    } catch (error) {
      config.clear();
      console.error("Setup Failed, Please check your site url, personal access token: ", error);
    }
  });

program.parse(process.argv);

const getAttachmentPermalink = async (name: string) => {
  const { data: policy } = await apiClient.get<Policy>(
    `/apis/storage.halo.run/v1alpha1/policies/${config.get("policyName")}`,
  );

  return new Promise((resolve, reject) => {
    const fetchPermalink = () => {
      apiClient
        .get(`/apis/storage.halo.run/v1alpha1/attachments/${name}`)
        .then((response) => {
          const permalink = response.data.status.permalink;
          if (permalink) {
            if (policy.spec.templateName === "local") {
              resolve(`${config.get("siteUrl")}${permalink}`);
            } else {
              resolve(permalink);
            }
          } else {
            setTimeout(fetchPermalink, 1000);
          }
        })
        .catch((error) => reject(error));
    };
    fetchPermalink();
  });
};
