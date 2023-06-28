const { Events, ActivityType, EmbedBuilder } = require('discord.js');
const { roleMention, bold } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');
const he = require('he');
const botConfiguration = require('../config/bot-configuration.json');
const videoPings = require('../config/video-pings.json');
const videoUpdate = require('../config/video-update.json');
const { log } = require('../logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        switch (botConfiguration.botActivity) {
            case 'watching':    client.user.setActivity(botConfiguration.botActivityDetails, { type: ActivityType.Watching }); break;
            case 'streaming':   client.user.setActivity(botConfiguration.botActivityDetails, { type: ActivityType.Streaming }); break;
            case 'playing':     client.user.setActivity(botConfiguration.botActivityDetails, { type: ActivityType.Playing }); break;
            case 'listening':   client.user.setActivity(botConfiguration.botActivityDetails, { type: ActivityType.Listening }); break;
            case 'competing':   client.user.setActivity(botConfiguration.botActivityDetails, { type: ActivityType.Competing }); break;
        }
        
        switch (botConfiguration.botStatus) {
            case 'online':      client.user.setStatus('online'); break;
            case 'idle':        client.user.setStatus('idle'); break;
            case 'dnd':         client.user.setStatus('dnd'); break;
            case 'invisible':   client.user.setStatus('invisible'); break;
        }

        console.log(`Bot works! Logged as ${client.user.tag}, he is ${botConfiguration.botActivity} ${botConfiguration.botActivityDetails}`);

        // log(`Bot uruchomiony! Zalogowano jako ${client.user.tag}, ${botConfiguration.botActivity} ${botConfiguration.botActivityDetails}`);

        // DON'T TOUCH THE CODE BELOW UNDER ANY CIRCUMSTANCES! WORKS = DON'T TOUCH!
        setInterval(findNewVideos, 60_000);

        async function findNewVideos() {

            let response;
            try {
                // response = await axios('https://animeni.pl/wp-json/wp/v2/anime?per_page=10&_embed', { headers: {"Accept-Encoding": "*"} });
                response = await axios('https://animeni.pl/wp-json/wp/v2/posts?per_page=10&_embed', { headers: {"Accept-Encoding": "*"} });
            } catch (error) {
                console.log('Nie udało się pobrać informacji o nowych odcinkach');
                return;
            }

            let newVideosCount = -1;

            for (const singleVideo of response.data) {
                if (singleVideo.slug === videoUpdate.lastKnownVideoSlug) break;
                
                newVideosCount++;
            }

            for (let i = newVideosCount; i >= 0; i--) {
                const videoData = response.data[i];
                
                // const videoThumbnailData = `https://animeni.pl/?attachment_id=${videoData.acf.okladka_filmu}`;
                let videoImageData = 'https://animeni.pl/';
                if (videoData.featured_image_data !== null) {
                    videoImageData = videoData.featured_image_data.src;
                }
                
                // if (videoData.acf.tlumaczy_grupa.includes('<a')) {
                //     videoData.acf.tlumaczy_grupa = videoData.acf.tlumaczy_grupa.split('>')[1].slice(0, -3);     //Extract data from link
                // }

                const fields = [
                    {
                        name: 'Informacje:',
                        value: videoData.content.rendered.replace(/<[^>]+>/g, '') || 'Brak szczegółów',
                    },
                    // {
                    //     name: 'Informacje o tłumaczeniu:',
                    //     value: 
                    //     `Grupa: ${videoData.acf.tlumaczy_grupa || 'Brak informacji'}
                    //     Tłumaczenie: ${videoData.acf.tlumaczenie || 'Brak informacji'}
                    //     Korekta: ${videoData.acf.korekta ? videoData.acf.korekta.replace('&amp;', '&') : 'Brak informacji'}
                    //     Typesetting: ${videoData.acf.typesetting || 'Brak informacji'}`,
                    // },
                    // {
                    //     name: 'Sezon:',
                    //     value: videoData.acf.sezon ? `${videoData.acf.sezon}` : 'Brak informacji',
                    //     inline: true,
                    // },
                    // {
                    //     name: 'Nr odcinka:',
                    //     value: videoData.acf.wpisz_numer_odcinka ? `${videoData.acf.wpisz_numer_odcinka}` : 'Brak informacji',
                    //     inline: true,
                    // },
                    // {
                    //     name: 'Długość:',
                    //     value: videoData.acf.czas_trwania ? `${videoData.acf.czas_trwania} min` : 'Brak informacji',
                    //     inline: true,
                    // },
                ];

                let extraRolePingID = '';
                let channelID = videoUpdate.videoChannelID1;
                const videoName = videoData.link.split('/')[3];     //Extract video name from link
                for (const videoPing in videoPings) {
                    if (videoName.includes(videoPings[videoPing][0])) {
                        extraRolePingID = videoPings[videoPing][1];
                        if (videoPings[videoPing][2] !== undefined && videoPings[videoPing][2] !== 1) {
                            channelID = videoUpdate.videoChannelID2;
                        }
                    } 
                }

                const descripton = `${bold('Zapraszamy do oglądania!')} ${roleMention(videoPings.odcinki[1])} ${extraRolePingID !== '' ? roleMention(extraRolePingID) : ''}`;

                const videoEmbed = new EmbedBuilder()
                    .setColor(0x950A0A)
                    .setTitle(he.decode(videoData.title.rendered))
                    .setURL(videoData.link)
                    // .setAuthor({ name: videoData._embedded.author[0].name, iconURL: videoData._embedded.author[0].avatar_urls["24"], url: videoData._embedded.author[0].link })
                    // .setDescription(descripton)
                    // .setThumbnail(videoThumbnailData)
                    .addFields(fields)
                    .setImage(videoImageData)
                    .setTimestamp()
                    .setFooter({ text: 'AnimeNi', iconURL: client.user.displayAvatarURL() });

                const channel = client.channels.cache.get(channelID);
                await channel.send({ content: descripton, embeds: [videoEmbed] });

                // log(`Wysłano powiadomienie o nowym odcinku "${videoData.title.rendered}" na kanał ${channel.name}`);
                
                if (!i) {
                    videoUpdate.lastKnownVideoSlug = videoData.slug;
                    const vidoeUpdateFile = path.resolve(__dirname, '../config/video-update.json');
                    fs.writeFile(vidoeUpdateFile, JSON.stringify(videoUpdate), (error) => {
                        if (error) console.log(error);
                    });
                }
            }
        }
    },
};
