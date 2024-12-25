import OctaJS, { ALL_INTENTS } from "octajs";

const octajs = new OctaJS(
  {
    token: token,
    catchError: true,
    showLogo: false,
  },
  {
    intents: ALL_INTENTS,
  }
);

const connections: { [key: string]: any } = {};

import { EventEmitter } from "events";

const event = new EventEmitter();
const CHAN_ID = "1318844845804224553";

import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";

import { exec } from "child_process";
import { join } from "path";
import { rm, writeFileSync, existsSync, readFileSync } from "fs";

import DATA from "./replacer.json";
import token from "./tk";

function isValidHttpUrl(string: string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

const voiceList = [
  "Default",
  "Yuna",
  "Eddy (한국어(대한민국))",
  "Flo (한국어(대한민국))",
  "Grandma (한국어(대한민국))",
  "Grandpa (한국어(대한민국))",
  "Reed (한국어(대한민국))",
  "Rocko (한국어(대한민국))",
  "Sandy (한국어(대한민국))",
  "Shelley (한국어(대한민국))",
  "Kyoko",
];

octajs
  .event({
    type: "messageCreate",
    listener(bot, message) {
      if (message.author.bot) return;
      if (message.channel.id !== CHAN_ID) return;

      if (isValidHttpUrl(message.content)) return;

      event.emit("message", message.content, message);
    },
  })
  .command({
    name: "join",
    description: "아리스 우타이마스!",
    async executes(bot, inter) {
      // get user's voice channel
      const mem = inter.member;
      if (!mem)
        return inter.reply({
          content: "아리스 우타노 우타이마센.",
          ephemeral: true,
        });
      const channel = (mem as any).voice.channel;
      if (!channel)
        return inter.reply({
          content: "아리스 우타노 우타이마센.",
          ephemeral: true,
        });
      //   console.log(channel);

      // defer
      await inter.deferReply();

      await (async () => {
        const chanid = channel.id;
        const connection = joinVoiceChannel({
          channelId: chanid,
          guildId: inter.guildId!,

          adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        const evListener = (msg: string, msgev: any) => {
          let message = msg;
          for (const key in DATA) {
            message = message.replaceAll(key, (DATA as any)[key]);
          }

          if (message == "!") message = "응!";
          if (message == "!!") message = "응응!";
          if (message == ".") message = "점";
          if (message == "..") message = "으..";
          if (message == "...") message = "으으..";
          if (message == "ㅇ?") message = "응?";

          const zzzRegex = /zz(z)+/g;
          message = message.replaceAll(zzzRegex, "크크크");
          const zzRegex = /zz/g;
          message = message.replaceAll(zzRegex, "크크");
          if (message == "z" || message == "ㅋ") {
            message = "키윽!";
          }

          const korzzz = /ㅋㅋ(ㅋ)+/g;
          message = message.replaceAll(korzzz, "크크크");

          const korzz = /ㅋㅋ/g;
          if (korzz.test(message)) {
            message = "크크";
          }

          const korbbb = /ㅠㅠ(ㅠ)+/g;
          message = message.replaceAll(korbbb, "유유유");
          const korbb = /ㅠㅠ/g;
          message = message.replaceAll(korbb, "유유");

          if (message == "ㅔ") message = "에";
          if (message == "ㅔ?") message = "에?";
          if (message == "ㅗ") message = "엿";

          if (message == "?") message = "응?";

          const korhhhhh = /ㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗ(ㅗ)+/g;
          const korhhhh = /ㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗ(ㅗ)+/g;
          const korhhh = /ㅗㅗㅗㅗ(ㅗ)+/g;
          const korhh = /ㅗ(ㅗ)+/g;

          if (korhhhhh.test(message)) {
            message = "대노";
          } else if (korhhhh.test(message)) {
            message = "존나 많은 엿";
          } else if (korhhh.test(message)) {
            message = "많은 엿";
          } else if (korhh.test(message)) {
            message = "조금 많은 엿";
          }

          let vArg = "";

          const cfgPath = join(__dirname, "cfg", msgev.author.id);
          if (existsSync(cfgPath)) {
            const idx = parseInt(readFileSync(cfgPath).toString());
            if (idx > 0) {
              vArg = `-v "${voiceList[idx]}"`;
            }
          }

          const id = Math.random().toString(36).substring(2, 7);
          const proc = exec(
            `say '${message.replaceAll(
              "'",
              "\\'"
            )}' ${vArg} --output-file='${id}' --file-format='WAVE' --data-format='ulaw'`,
            {
              cwd: join(__dirname, "cache"),
            }
          );

          proc.on("exit", async () => {
            const resource = createAudioResource(
              join(__dirname, "cache", id + ".wav")
            );
            player.play(resource);
            setTimeout(() => {
              rm(join(__dirname, "cache", id + ".wav"), () => {});
              (msgev as any).delete();
            }, 1000);
          });
        };

        event.on("message", evListener);

        connections[chanid] = async () => {
          // TODO: destory connection
          await connection.disconnect();

          event.off("message", evListener);
        };
      })();

      await inter.editReply({
        content: "아리스 우타이마스!",
      });
    },
  })
  .command({
    name: "quit",
    description: "아리가 우타노 야매마스.",
    async executes(bot, inter) {
      // get user's voice channel

      const mem = inter.member;
      if (!mem)
        return inter.reply({
          content: "아리스 우타노 우타이마센.",
          ephemeral: true,
        });
      const channel = (mem as any).voice.channel;
      if (!channel)
        return inter.reply({
          content: "아리스 우타노 우타이마센.",
          ephemeral: true,
        });

      // defer
      await inter.deferReply();

      // close connection
      const chanid = channel.id;
      const connection = connections[chanid];
      if (connection) {
        await connection();
        delete connections[chanid];
      }

      await inter.editReply({
        content: "아리가 우타노 야매마스.",
      });
    },
  })
  .command({
    name: "voice",
    options: {
      voice: {
        type: "String",
        required: true,
        description: "목소리",
        choices: voiceList.map((v, i) => ({
          name: v,
          value: i.toString(),
        })),
      },
    },
    executes(bot, inter) {
      const idx = parseInt(inter.options.getString("voice")!);
      const voice = voiceList[idx];
      inter.reply({
        content: `목소리가 ${voice}로 변경되었습니다.`,
        ephemeral: true,
      });
      writeFileSync(join(__dirname, "cfg", inter.user.id), idx.toString());
    },
    description: "목소리 설정",
  })
  .onStart(() => {
    console.log("Bot is ready!");
  })
  .start();
