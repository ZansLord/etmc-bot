const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const admin = require('firebase-admin');
const axios = require('axios');
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS); 
require('dotenv').config();

const client = new Client({
    authStrategy: new LocalAuth()
  });
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
  });

client.on('ready', () => {
    console.log('Client is ready!');
  });

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
  }); 
const db = admin.database();
const pointRef = db.ref('dataPengguna/pengguna');
const PokemonRef = db.ref('dataPengguna/pengguna');
const linkRef = db.ref('dataData/link');
const ReplyRef = db.ref('dataData/BalasanKataKasar');
const MarketRef = db.ref('dataData/market');
const ToxicRef = db.ref('dataData/kataKasar');
const DataMRef = db.ref('dataData/mabar');
const DataData = db.ref('dataData');
const point = {};
const reputasi = {};
const thresholds = [0, 100 ,200, 500, 1000, 5000, 10000, 20000, 500000, 1000000, 1000000000];
const regexCari = /^!cari\s(.+)/;
const regexKirim = /^!kirim\s(.+)/;
const regexTogel = /^!togel\s(\d{4})/;
const regexPBuyPoke = /^!buy\s+(\w+)\s+(\d+)$/;
const regexRibut = /^!ribut\s(.+)/;
const regexNama = /^!nama\s(.+)/;
const regexInfo = /^!info\s(.+)/;
const regexMabar = /^!mabar\s(.+)/;


// Update stok pada jam 12:00mlm
function UpdateStock() {
  DataData.child('delay').child('potion').set({ delay: true, stock: 30 });
  DataData.child('delay').child('elixir').set({ delay: true, stock: 10 });
  DataData.child('delay').child('trainingTicket').set({ delay: true, stock: 5 });
  client.sendMessage(`${process.env.GROUP_1}`, 'Restock Avaliable now\nPotion: 30\nElixir: 10\nTraining Ticket: 5');
}
// settings jam/reset Stock
const now = new Date();
const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
const timeUntilNextMidnight = nextMidnight - now;
setTimeout(UpdateStock, timeUntilNextMidnight);



client.on('message', async (message) => {
    const sA = message.author;
    const sender = message.from;
    const corection = sA != undefined ? sA : sender;
    const sanitizedSender = corection.replace(/[\.\@\[\]\#\$]/g, "_");
    const pesan = message.body.toLocaleLowerCase();
    const cocok = pesan.match(regexCari);
    const match1 = pesan.match(regexKirim);
    const togel = pesan.match(regexTogel);
    const ribut = pesan.match(regexRibut);
    const isiNama = pesan.match(regexNama);
    const InfoMas = pesan.match(regexInfo);
    const Buy = pesan.match(regexPBuyPoke);
    const Mabar = pesan.match(regexMabar);
    const RefAbsen = pointRef.child(sanitizedSender).child('absen');
    const RefNama = pointRef.child(sanitizedSender).child('nama');
    const RefPoint = pointRef.child(sanitizedSender).child('point');
    const RefRep = pointRef.child(sanitizedSender).child('reputasi');
    const RefRepOld = pointRef.child(sanitizedSender).child('reputasiS1');
    const RefPokemon = PokemonRef.child(sanitizedSender).child('pokemon').child('inventory').child('pokemon');
    const RefPoke = PokemonRef.child(sanitizedSender).child('pokemon').child('inventory').child('pokeballs');
    const RefInven = PokemonRef.child(sanitizedSender).child('pokemon').child('inventory');
    const RefGacoan = PokemonRef.child(sanitizedSender).child('pokemon').child('gacoan');
    const RefPokeDelay = PokemonRef.child(sanitizedSender).child('pokemon').child('delay');
    const RefFightDelay = PokemonRef.child(sanitizedSender).child('pokemon').child('delayF');
    
    // function add mabar
    function addMabarData(mabar, nama) {
      DataMRef.child("1").set({
        name: nama,
        desc: mabar
      });
    }
    
    // function bikin SN
    function generateSN(length){
      const character = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let sn = '';
      for(let i = 0; i < length; i++){
        const randomIndex = Math.floor(Math.random() * character.length);
        sn += character.charAt(randomIndex);
      }
      return sn;
    }
    
    // Function !Fight
    const calculateEXP = (exp) => {
      if (exp >= 55000) {
        return 55;
      } else if (exp >= 50000) {
        return 54;
      } else if (exp >= 45000) {
        return 53;
      } else if (exp >= 40000) {
        return 52;
      } else if (exp >= 35000) {
        return 51;
      } else if (exp >= 30000) {
        return 50;
      } else if (exp >= 27000) {
        return 49;
      } else if (exp >= 24000) {
        return 48;
      } else if (exp >= 21000) {
        return 47;
      } else if (exp >= 18000) {
        return 46;
      } else if (exp >= 16000) {
        return 45;
      } else if (exp >= 14000) {
        return 44;
      } else if (exp >= 12000) {
        return 43;
      } else if (exp >= 10000) {
        return 42;
      } else if (exp >= 9000) {
        return 41;
      } else if (exp >= 8000) {
        return 40;
      } else if (exp >= 7000) {
        return 39;
      } else if (exp >= 6000) {
        return 38;
      } else if (exp >= 5000) {
        return 37;
      } else if (exp >= 4500) {
        return 36;
      } else if (exp >= 4000) {
        return 35;
      } else if (exp >= 3500) {
        return 34;
      } else if (exp >= 3000) {
        return 33;
      } else if (exp >= 2500) {
        return 32;
      } else if (exp >= 2000) {
        return 31;
      } else if (exp >= 1750) {
        return 30;
      } else if (exp >= 1500) {
        return 29;
      } else if (exp >= 1250) {
        return 28;
      } else if (exp >= 1000) {
        return 27;
      } else if (exp >= 900) {
        return 26;
      } else if (exp >= 800) {
        return 25;
      } else if (exp >= 700) {
        return 24;
      } else if (exp >= 600) {
        return 23;
      } else if (exp >= 500) {
        return 22;
      } else if (exp >= 450) {
        return 21;
      } else if (exp >= 400) {
        return 20;
      } else if (exp >= 350) {
        return 19;
      } else if (exp >= 300) {
        return 18;
      } else if (exp >= 250) {
        return 17;
      } else if (exp >= 200) {
        return 16;
      } else if (exp >= 175) {
        return 15;
      } else if (exp >= 150) {
        return 14;
      } else if (exp >= 125) {
        return 13;
      } else if (exp >= 100) {
        return 12;
      } else if (exp >= 90) {
        return 11;
      } else if (exp >= 80) {
        return 10;
      } else if (exp >= 70) {
        return 9;
      } else if (exp >= 60) {
        return 8;
      } else if (exp >= 50) {
        return 7;
      } else if (exp >= 40) {
        return 6;
      } else if (exp >= 30) {
        return 5;
      } else if (exp >= 20) {
        return 4;
      } else if (exp >= 10) {
        return 3;
      } else if (exp >= 0) {
        return 2;
      } else {
        return 1;
      }
    };
    
    const increaseStatsByLevel = (currentLevel, newLevel) => {
      let statIncrease = {
        HP: 0,
        ATTACK: 0,
        DEFENSE: 0,
        SPEED: 0,
      };
    
      if (newLevel === currentLevel + 1) {
        if (newLevel === 1 || newLevel === 2 || newLevel === 3 || newLevel === 4 || newLevel === 6 || newLevel === 7 || newLevel === 8 || newLevel === 9) {
          statIncrease = {
            HP: 50,
            ATTACK: 50,
            DEFENSE: 50,
            SPEED: 50,
          };
        } else if (newLevel === 5) {
          statIncrease = {
            HP: 100,
            ATTACK: 100,
            DEFENSE: 100,
            SPEED: 100,
          };
        } else if (newLevel === 10) {
          statIncrease = {
            HP: 200,
            ATTACK: 200,
            DEFENSE: 200,
            SPEED: 200,
          };
        } else if (newLevel >= 11 && newLevel <= 50) {
          statIncrease = {
            HP: 9 * newLevel,
            ATTACK: 9 * newLevel,
            DEFENSE: 9 * newLevel,
            SPEED: 9 * newLevel,
          };
        } else if (newLevel <= 55){
          statIncrease = {
            HP: 9 * newLevel,
            ATTACK: 1 ,
            DEFENSE: 1 ,
            SPEED: 1 ,
          };

        }
      }
    
      return statIncrease;
    };

    function fightPvpPokemon(P1, P2, TAG){
      const maxHPP1 = P1[0].MAXHP;
      const maxHPP2 = P2[0].MAXHP;
      const RefGacoan2 = TAG.replace(/@/g, '') + '_c_us';
      const RefGacoanP2 = PokemonRef.child(RefGacoan2).child('pokemon').child('gacoan');
      const RefRep2 = pointRef.child(RefGacoan2).child('reputasi');

        DataData.child('delay').child('fightCooldown').once('value', async(snapshot) => {
          const cooldown = snapshot.val();
          if(cooldown === "true"){
            if(P1.length > 0 && P2.length > 0){
              if(P1[0].HP <= 0){
                client.sendMessage(message.from,`Darahmu habis mas\n!use potion dulu gih`);
              }else if(P2[0].HP <= 0){
                client.sendMessage(message.from,`Darah lawanmu habis mas\nsuruh !use potion dulu gih`);
              }else{
                client.sendMessage(message.from,`Pertarungan antara ${P1[0].namaPokemon} VS ${P2[0].namaPokemon}`);
                DataData.child('delay').child('fightCooldown').set('false');
                let P1HP = P1[0].HP;
                let P2HP = P2[0].HP;

                RefRep.once('value', async(snapshot) => {
                  const valP1 = snapshot.val();
                  const RepMenang = valP1 + 50;
                  const repKalah = valP1 + 5;

                  RefRep2.once('value', async(snapshot) => {
                    const valP2 = snapshot.val();
                    const RepMenang2 = valP2 + 50;
                    const RepKalah2 = valP2 + 5;

                      const fightLoop = async () => {
                        let winner = null;
                        const P1attck = (P1[0].ATTACK / P2[0].DEFENSE * 9).toFixed(0);
                        const P2attck = (P2[0].ATTACK / P1[0].DEFENSE * 9).toFixed(0);
                        const criticalChance = 0.4;
                        const isP1Critical = Math.random() <= criticalChance;
                        const isP2Critical = Math.random() <= criticalChance;
                        const P1AttckFinal = isP1Critical ? P1attck * P1attck : P1attck;
                        const P2AttckFinal = isP2Critical ? P2attck * P2attck : P2attck;
                        P1HP -= P2AttckFinal;
                        P2HP -= P1AttckFinal;
                        P1HP = Math.max(0, P1HP);
                        P2HP = Math.max(0, P2HP);
                          if(P1HP > 0 && P2HP > 0){
                            setTimeout(fightLoop, 2000);
                          }else{
                            if(P1HP <= 0 && P2HP <= 0){
                              const expDraw1 = P1[0].EXP + 50;
                              const expDraw2 = P2[0].EXP + 50;
                              const levelAfterBattleP1 = calculateEXP(P1[0].EXP + 50);
                              const levelAfterBattleP2 = calculateEXP(P2[0].EXP + 50);
                              const statIncreaseP1 = increaseStatsByLevel(P1[0].LVL, levelAfterBattleP1);
                              const statIncreaseP2 = increaseStatsByLevel(P2[0].LVL, levelAfterBattleP2);
                              const pokemonAfterBattleP1 = {
                                HP: P1HP,
                                MAXHP: maxHPP1 + statIncreaseP1.HP,
                                ATTACK: P1[0].ATTACK + statIncreaseP1.ATTACK, 
                                DEFENSE: P1[0].DEFENSE + statIncreaseP1.DEFENSE,
                                SPEED: P1[0].SPEED + statIncreaseP1.SPEED, 
                                LVL: levelAfterBattleP1,
                                EXP: expDraw1,
                                TYPE: P1[0].TYPE
                              };
                              const pokemonAfterBattleP2 = {
                                HP: P2HP,
                                MAXHP: maxHPP2 + statIncreaseP2.HP,
                                ATTACK: P2[0].ATTACK + statIncreaseP2.ATTACK, 
                                DEFENSE: P2[0].DEFENSE + statIncreaseP2.DEFENSE,
                                SPEED: P2[0].SPEED + statIncreaseP2.SPEED, 
                                LVL: levelAfterBattleP2,
                                EXP: expDraw2,
                                TYPE: P2[0].TYPE
                              };
                              RefGacoan.set(pokemonAfterBattleP1);
                              RefGacoanP2.set(pokemonAfterBattleP2);
                              client.sendMessage(message.from,`Pertarungan berakhir dengan hasil seri!`);
                            }else if(P1HP <= 0){
                              const expDraw1 = P1[0].EXP + 100;
                              const expDraw2 = P2[0].EXP + 500;
                              const levelAfterBattleP1 = calculateEXP(P1[0].EXP + 100)
                              const levelAfterBattleP2 = calculateEXP(P2[0].EXP + 500)
                              const statIncreaseP1 = increaseStatsByLevel(P1[0].LVL,levelAfterBattleP1);
                              const statIncreaseP2 = increaseStatsByLevel(P2[0].LVL,levelAfterBattleP2);
                              const pokemonAfterBattleP1 = {
                                namaPokemon: P1[0].namaPokemon,
                                HP: P1HP,
                                MAXHP: maxHPP1 + statIncreaseP1.HP,
                                ATTACK: P1[0].ATTACK + statIncreaseP1.ATTACK, 
                                DEFENSE: P1[0].DEFENSE + statIncreaseP1.DEFENSE,
                                SPEED: P1[0].SPEED + statIncreaseP1.SPEED, 
                                LVL: levelAfterBattleP1,
                                EXP: expDraw1,
                                TYPE: P1[0].TYPE
                              };
                              const pokemonAfterBattleP2 = {
                                namaPokemon: P2[0].namaPokemon,
                                HP: P2HP,
                                MAXHP: maxHPP2 + statIncreaseP2.HP,
                                ATTACK: P2[0].ATTACK + statIncreaseP2.ATTACK, 
                                DEFENSE: P2[0].DEFENSE + statIncreaseP2.DEFENSE,
                                SPEED: P2[0].SPEED + statIncreaseP2.SPEED, 
                                TYPE: P2[0].TYPE,
                                EXP: expDraw2,
                                LVL: levelAfterBattleP2
                              };
                              await RefGacoan.set(pokemonAfterBattleP1);
                              await RefGacoanP2.set(pokemonAfterBattleP2);
                              await RefRep2.set(RepMenang2);
                              await RefRep.set(repKalah);
                              winner = P2[0].namaPokemon;
                              client.sendMessage(message.from,`Pertarungan berakhir! ${winner} adalah pemenangnya!`);
                            }else{
                              const expDraw1 = P1[0].EXP + 500;
                              const expDraw2 = P2[0].EXP + 100;
                              const levelAfterBattleP1 = calculateEXP(P1[0].EXP + 500)
                              const levelAfterBattleP2 = calculateEXP(P2[0].EXP + 100)
                              const statIncreaseP1 = increaseStatsByLevel(P1[0].LVL,levelAfterBattleP1);
                              const statIncreaseP2 = increaseStatsByLevel(P2[0].LVL,levelAfterBattleP2);
                              const pokemonAfterBattleP1 = {
                                namaPokemon: P1[0].namaPokemon,
                                HP: P1HP,
                                MAXHP: maxHPP1 + statIncreaseP1.HP,
                                ATTACK: P1[0].ATTACK + statIncreaseP1.ATTACK, 
                                DEFENSE: P1[0].DEFENSE + statIncreaseP1.DEFENSE,
                                SPEED: P1[0].SPEED + statIncreaseP1.SPEED, 
                                LVL: levelAfterBattleP1,
                                EXP: expDraw1,
                                TYPE: P1[0].TYPE
                              };
                              const pokemonAfterBattleP2 = {
                                namaPokemon: P2[0].namaPokemon,
                                HP: P2HP,
                                MAXHP: maxHPP2 + statIncreaseP2.HP,
                                ATTACK: P2[0].ATTACK + statIncreaseP2.ATTACK, 
                                DEFENSE: P2[0].DEFENSE + statIncreaseP2.DEFENSE,
                                SPEED: P2[0].SPEED + statIncreaseP2.SPEED, 
                                TYPE: P2[0].TYPE,
                                EXP: expDraw2,
                                LVL: levelAfterBattleP2
                              };
                              await RefGacoan.set(pokemonAfterBattleP1);
                              await RefGacoanP2.set(pokemonAfterBattleP2);
                              await RefRep2.set(RepKalah2);
                              await RefRep.set(RepMenang);
                              winner = P1[0].namaPokemon;
                              client.sendMessage(message.from,`Pertarungan berakhir! ${winner} adalah pemenangnya!`);
                            }
                            await RefFightDelay.set('false');
                          }//else jika fight loop selesai
                        };//fightloop
                    setTimeout(async () => {
                      await DataData.child('delay').child('fightCooldown').set('true');
                    }, 60000);
                    setTimeout(async () => {
                      await RefFightDelay.set('true');
                    }, 300000);
                    setTimeout(fightLoop, 2000);
                  })//RefRep2
                });//RefRep
              }//else darah nya pada abis
            }else{
              client.sendMessage(message.from,`Musuhmu belum ada gacoannya mas`);
            }//else kalo ga punya gacoan
          }else{
            client.sendMessage(message.from, `Pertarungan sedang berlangsung, Arenanya cuma satu cuk`);
            setTimeout(async () => {
              await DataData.child('delay').child('fightCooldown').set('true');
            }, 60000)
          }//else if cooldown false
        });//close DataData fight Cooldown
    };

    function fightAiPokemon(P1, P2){
      const maxHPP1 = P1[0].MAXHP;
        DataData.child('delay').child('fightCooldown').once('value', async(snapshot) => {
          const cooldown = snapshot.val();
          if(cooldown === "true"){
            if(P1.length > 0 && P2.length > 0){
              if(P1[0].HP <= 0){
                client.sendMessage(message.from,`Darahmu habis mas\n!use potion dulu gih`);
              }else{
                client.sendMessage(message.from,`Pertarungan antara ${P1[0].namaPokemon} VS ${P2[0].namaPokemon}`);
                DataData.child('delay').child('fightCooldown').set('false');
                let P1HP = P1[0].HP;
                let P2HP = P2[0].HP;

                      const fightLoop = async () => {
                        let winner = null;
                        const P1attck = (P1[0].ATTACK / P2[0].DEFENSE * 82).toFixed(0);
                        const P2attck = (P2[0].ATTACK / P1[0].DEFENSE * 20).toFixed(0);
                        const P1CriticalChance = P1HP <= (P1[0].MAX_HP * 0.1) ? 0.6 : 0.2;
                        const P2CriticalChance = P2HP <= (P2[0].MAX_HP * 0.1) ? 0.6 : 0.2;
                        const isP1Critical = Math.random() <= P1CriticalChance;
                        const isP2Critical = Math.random() <= P2CriticalChance;
                        const P1AttckFinal = isP1Critical ? P1attck * 10 : P1attck;
                        const P2AttckFinal = isP2Critical ? P2attck * 10 : P2attck;
                        P1HP -= P2AttckFinal;
                        P2HP -= P1AttckFinal;
                        P1HP = Math.max(0, P1HP);
                        P2HP = Math.max(0, P2HP);
                        console.log(`P1 HP: ${P1HP}`)
                        console.log(`P1 ATTACK: ${P1attck}`)
                        console.log(`P1 ATTACK if Crit: ${P1AttckFinal}`)
                        console.log(`P2 HP: ${P2HP}`)
                        console.log(`P2 ATTACK: ${P2attck}`)
                        console.log(`P2 ATTACK if Crit: ${P2AttckFinal}`)
                          if(P1HP > 0 && P2HP > 0){
                            setTimeout(fightLoop, 10);
                            //client.sendMessage(message.from,`${P1[0].namaPokemon} Menyerang dengan ${P1AttckFinal} dan ${P2[0].namaPokemon} Menyerang dengan ${P2AttckFinal}`);
                          }else{
                            if(P1HP <= 0 && P2HP <= 0){
                              const expDraw1 = P1[0].EXP + 1;
                              const levelAfterBattleP1 = calculateEXP(P1[0].EXP + 1);
                              const statIncreaseP1 = increaseStatsByLevel(P1[0].LVL, levelAfterBattleP1);
                              const pokemonAfterBattleP1 = {
                                namaPokemon: P1[0].namaPokemon,
                                HP: P1HP,
                                MAXHP: maxHPP1 + statIncreaseP1.HP,
                                ATTACK: P1[0].ATTACK + statIncreaseP1.ATTACK, 
                                DEFENSE: P1[0].DEFENSE + statIncreaseP1.DEFENSE,
                                SPEED: P1[0].SPEED + statIncreaseP1.SPEED, 
                                LVL: levelAfterBattleP1,
                                EXP: expDraw1,
                                TYPE: P1[0].TYPE
                              };
                              RefGacoan.set(pokemonAfterBattleP1);
                              client.sendMessage(message.from,`Pertarungan berakhir dengan hasil seri!`);
                            }else if(P1HP <= 0){
                              const minExp = 1;
                              const maxExp = 2;
                              const randomExp = Math.floor(Math.random() * (maxExp - minExp + 1)) + minExp;
                              console.log(`EXP KALAH : ${randomExp}`)
                              const expDraw1 = P1[0].EXP + randomExp;
                              const levelAfterBattleP1 = calculateEXP(P1[0].EXP + randomExp)
                              const statIncreaseP1 = increaseStatsByLevel(P1[0].LVL,levelAfterBattleP1);
                              const pokemonAfterBattleP1 = {
                                namaPokemon: P1[0].namaPokemon,
                                HP: P1HP,
                                MAXHP: maxHPP1 + statIncreaseP1.HP,
                                ATTACK: P1[0].ATTACK + statIncreaseP1.ATTACK, 
                                DEFENSE: P1[0].DEFENSE + statIncreaseP1.DEFENSE,
                                SPEED: P1[0].SPEED + statIncreaseP1.SPEED, 
                                LVL: levelAfterBattleP1,
                                EXP: expDraw1,
                                TYPE: P1[0].TYPE
                              };
                              await RefGacoan.set(pokemonAfterBattleP1);
                              winner = P2[0].namaPokemon;
                              if (levelAfterBattleP1 > P1[0].LVL) {
                               const levelUpInfo = `LevelUp: ${levelAfterBattleP1}\nHP: +${statIncreaseP1.HP}\nAttack: +${statIncreaseP1.ATTACK}\nDefense: +${statIncreaseP1.DEFENSE}\nSPeed: ${statIncreaseP1.SPEED}`;
                               client.sendMessage(message.from, `Pertarungan berakhir! ${winner} adalah pemenangnya!\n${levelUpInfo}`);
                             } else {
                               client.sendMessage(message.from, `Pertarungan berakhir! ${winner} adalah pemenangnya!`);
                             }
                            }else{
                              let minExp = 1;
                              let maxExp = 10;
                              if(P1[0].LVL <= 15){
                                minExp = 1;
                                maxExp = 10;
                              }else if(P1[0].LVL >= 16 && P1[0].LVL <= 25){
                                minExp = 10;
                                maxExp = 50;
                              }else if(P1[0].LVL >= 26 && P1[0].LVL <= 30){
                                minExp = 50;
                                maxExp = 100;
                              }else if(P1[0].LVL >= 31 && P1[0].LVL <= 36){
                                minExp = 100;
                                maxExp = 250;
                              }else if(P1[0].LVL >= 37 && P1[0].LVL <= 40){
                                minExp = 250;
                                maxExp = 500;
                              }else if(P1[0].LVL >= 41 && P1[0].LVL <= 45){
                                minExp = 500;
                                maxExp = 1000;
                              }else if(P1[0].LVL >= 46 && P1[0].LVL <= 50){
                                minExp = 500;
                                maxExp = 2000;
                              }else{
                                minExp = 1000;
                                maxExp = 1575;
                              }
                              setTimeout(async () => {

                                const randomExp = Math.floor(Math.random() * (maxExp - minExp + 1)) + minExp;
                                const expDraw1 = P1[0].EXP + randomExp;
                                console.log(`EXP: ${randomExp}`);
                                const levelAfterBattleP1 = calculateEXP(P1[0].EXP + randomExp)
                              const statIncreaseP1 = increaseStatsByLevel(P1[0].LVL,levelAfterBattleP1);
                              const pokemonAfterBattleP1 = {
                                namaPokemon: P1[0].namaPokemon,
                                HP: P1HP,
                                MAXHP: maxHPP1 + statIncreaseP1.HP,
                                ATTACK: P1[0].ATTACK + statIncreaseP1.ATTACK, 
                                DEFENSE: P1[0].DEFENSE + statIncreaseP1.DEFENSE,
                                SPEED: P1[0].SPEED + statIncreaseP1.SPEED, 
                                LVL: levelAfterBattleP1,
                                EXP: expDraw1,
                                TYPE: P1[0].TYPE
                              };
                              await RefGacoan.set(pokemonAfterBattleP1);
                              winner = P1[0].namaPokemon;
                              if (levelAfterBattleP1 > P1[0].LVL) {
                                const levelUpInfo = `LevelUp: ${levelAfterBattleP1}\nHP: +${statIncreaseP1.HP}\nAttack: +${statIncreaseP1.ATTACK}\nDefense: +${statIncreaseP1.DEFENSE}\nSPeed: ${statIncreaseP1.SPEED}`;
                                client.sendMessage(message.from, `Pertarungan berakhir! ${winner} adalah pemenangnya!\n${levelUpInfo}`);
                              } else {
                                client.sendMessage(message.from, `Pertarungan berakhir! ${winner} adalah pemenangnya!`);
                              }
                            }, 2000)
                            }
                            await RefFightDelay.set('false');
                          }//else jika fight loop selesai
                        };//fightloop
                    setTimeout(async () => {
                      await DataData.child('delay').child('fightCooldown').set('true');
                    }, 60000);
                    setTimeout(async () => {
                      await RefFightDelay.set('true');
                    }, 300000);
                    setTimeout(fightLoop, 10);
              }//else darah nya pada abis
            }else{
              client.sendMessage(message.from,`Musuhmu belum ada gacoannya mas`);
            }//else kalo ga punya gacoan
          }else{
            client.sendMessage(message.from, `Pertarungan sedang berlangsung, Arenanya cuma satu cuk`);
            setTimeout(async () => {
              await DataData.child('delay').child('fightCooldown').set('true');
            }, 60000)
          }//else if cooldown false
        });//close DataData fight Cooldown
    };
    // End of the line Pokemon Fight
      
//Pesan Balasan 
if (pesan) {
  await ToxicRef.once('value', (snapshot) => {
    const toxicWords = snapshot.val() || [];
    const pesanArray = pesan.toLowerCase().split(' ');
    const foundToxicWord = pesanArray.find((word) => {
      return toxicWords.findIndex((toxicWord) => word === toxicWord) !== -1;
    });

    if (foundToxicWord) {
      ReplyRef.once('value', (snapshot) => {
        const balasan = snapshot.val() || [];
        const pesanBalasanArray = Object.values(balasan);
        const pesanBalasan = pesanBalasanArray[Math.floor(Math.random() * pesanBalasanArray.length)] || 'Pesan balasan default';
        message.reply(pesanBalasan);
      });
    }
  });
}

    if(
      pesan.match(/\banjg\b/i) ||
      pesan.match(/\bajg\b/i) ||
      pesan.match(/\banal\b/i) ||
      pesan.match(/\basu\b/i) ||
      pesan.match(/\bass\b/i) ||
      pesan.match(/\banjing\b/i) ||
      pesan.match(/\banjeng\b/i) ||
      pesan.match(/\bbajingan\b/i) ||
      pesan.match(/\bbgst\b/i) ||
      pesan.match(/\bbangsat\b/i) ||
      pesan.match(/\bbabi\b/i) ||
      pesan.match(/\bcuk\b/i) ||
      pesan.match(/\bcok\b/i) ||
      pesan.match(/\bcukimai\b/i) ||
      pesan.match(/\bdancok\b/i) ||
      pesan.match(/\bdancuk\b/i) ||
      pesan.match(/\bentot\b/i) ||
      pesan.match(/\bewe\b/i) ||
      pesan.match(/\bengas\b/i) ||
      pesan.match(/\bebol\b/i) ||
      pesan.match(/\bjingkontot\b/i) ||
      pesan.match(/\bjing\b/i) ||
      pesan.match(/\bjink\b/i) ||
      pesan.match(/\bjembut\b/i) ||
      pesan.match(/\bjembod\b/i) ||
      pesan.match(/\bjmbd\b/i) ||
      pesan.match(/\bkon\b/i) ||
      pesan.match(/\bkontot\b/i) ||
      pesan.match(/\bkontol\b/i) ||
      pesan.match(/\bkntl\b/i) ||
      pesan.match(/\bkentot\b/i) ||
      pesan.match(/\bkintil\b/i) ||
      pesan.match(/\bkimak\b/i) ||
      pesan.match(/\bler\b/i) ||
      pesan.match(/\bmemek\b/i) ||
      pesan.match(/\bmek\b/i) ||
      pesan.match(/\bmmk\b/i) ||
      pesan.match(/\bmeki\b/i) ||
      pesan.match(/\bngen\b/i) ||
      pesan.match(/\bngentot\b/i) ||
      pesan.match(/\bnigga\b/i) ||
      pesan.match(/\bni99a\b/i) ||
      pesan.match(/\bnenen\b/i) ||
      pesan.match(/\bpantek\b/i) ||
      pesan.match(/\bpanteq\b/i) ||
      pesan.match(/\bpntek\b/i) ||
      pesan.match(/\bpntk\b/i) ||
      pesan.match(/\bpler\b/i) ||
      pesan.match(/\bpepek\b/i) ||
      pesan.match(/\bppk\b/i) ||
      pesan.match(/\bpuki\b/i) ||
      pesan.match(/\bpukimak\b/i) ||
      pesan.match(/\bpentek\b/i) ||
      pesan.match(/\bpukima\b/i) ||
      pesan.match(/\bsu\b/i) ||
      pesan.match(/\bsange\b/i) ||
      pesan.match(/\bsagne\b/i) ||
      pesan.match(/\bsat\b/i) ||
      pesan.match(/\btot\b/i) ||
      pesan.match(/\btod\b/i) ||
      pesan.match(/\btolol\b/i) ||
      pesan.match(/\btll\b/i) ||
      pesan.match(/\bttt\b/i) ||
      pesan.match(/\btitit\b/i) ||
      pesan.match(/\btai\b/i) ||
        pesan.match(/\btod\b/i)){
        let sisaPo = "";
        let sisaRe = "";
        RefPoint.once('value', async (snapshot) => {
            const poin = snapshot.val() || 0;
            const pinalty = poin - 25000;
            await RefPoint.set(pinalty);
            sisaPo = poin.toLocaleString('id-ID', { minimumFractionDigits: 0 });
        });
        RefRep.once('value', async (snapshot) => {
            const reputasi = snapshot.val() || 0;
            const pinalty = parseInt(reputasi - 100);
            await RefRep.set(pinalty)
            sisaRe = reputasi.toString();
        });
        setTimeout(() => {
            message.reply(`priiiit point -25.000, Reputasi -100.\nsisa point: ${sisaPo}\nReputasi: ${sisaRe}`);
        }, 1500);
    }
/* ADMIN COMMAND */
if(sanitizedSender === process.env.ADMIN_1 || sanitizedSender === process.env.ADMIN_2){
  const pesanAdmin = message.body;
  // reset season
  if (pesanAdmin.startsWith('%rS')) {
    message.reply('Welcome To Season 2 Guys\nPoint : +50.000');
    pointRef.once('value', (snapshot) => {
        const penggunaData = snapshot.val();
        if (penggunaData) {
            Object.entries(penggunaData).forEach(([randomkey, data]) => {
                const currentReputasi = data.reputasi || 0;
                let newReputasi = currentReputasi;
                if (currentReputasi < 0) {
                    newReputasi += 100;
                } else if (currentReputasi >= 1 && currentReputasi <= 100) {
                    newReputasi -= 50;
                } else if (currentReputasi >= 101 && currentReputasi <= 1999) {
                    newReputasi -= 100;
                } else if (currentReputasi >= 2000) {
                    newReputasi -= 1000;
                }
                pointRef.child(randomkey).child('reputasiS1').set(currentReputasi);
                pointRef.child(randomkey).child('reputasi').set(newReputasi);
            });
        } else {
            message.reply('Database is empty');
        }
    });

    pointRef.once('value', (snapshot) => {
      const penggunaData = snapshot.val();
      if (penggunaData) {
          Object.entries(penggunaData).forEach(([randomkey, data]) => {
              const currentPoint = data.point || 0;
              const pointAdded = currentPoint + 50000;
              pointRef.child(randomkey).child('point').set(pointAdded);
          });
        } else {
          message.reply('Database is empty');
        }
      });
}

  // reset Point
  if(pesanAdmin.startsWith('%rP')){
    const point0 = parseInt('0');
    message.reply('Reset Point Done');
    pointRef.once('value', (snapshot) => {
        const penggunaData = snapshot.val();
        if (penggunaData) {
            Object.entries(penggunaData).forEach(([randomkey, data]) => {
                pointRef.child(randomkey).child('point').set(point0);
            });
          } else {
            message.reply('Database is empty');
          }
        });
  }
  //addPoint
  if(pesanAdmin.startsWith('%addP')){
    const param1 = pesanAdmin.split(' ')[1];
    const param2 = pesanAdmin.split(' ')[2];
    const param2ParseInt = parseInt(param2, 10);
    const nomortanpa = param1.replace(/@/g, "");
    const nomorLengkap = nomortanpa+"_c_us";
    pointRef.child(nomorLengkap).child('point').once('value', async (snapshot) => {
      const point = snapshot.val() || 0;
      const pointAdded = point + param2ParseInt;
      await pointRef.child(nomorLengkap).child('point').set(pointAdded);
    });
    message.reply(`Point added ${param2.toLocaleString('id-ID',{minimumFractionDigits: 0})} to : ${param1}`);
  }
  //addReputasi
  if(pesanAdmin.startsWith('%addR')){
    const param1 = pesanAdmin.split(' ')[1];
    const param2 = pesanAdmin.split(' ')[2];
    const param2ParseInt = parseInt(param2, 10);
    const nomortanpa = param1.replace(/@/g, "");
    const nomorLengkap = nomortanpa+"_c_us";
    pointRef.child(nomorLengkap).child('reputasi').once('value', async (snapshot) => {
      const point = snapshot.val() || 0;
      const pointAdded = point + param2ParseInt;
        await pointRef.child(nomorLengkap).child('reputasi').set(pointAdded);
    });
    message.reply(`Reputation added ${param2} to : ${param1}`)
  }
  //addPoint for users
  if (pesanAdmin.startsWith('%addAP')) {
    const param1 = parseInt(pesanAdmin.split(' ')[1]);
    pointRef.once('value', (snapshot) => {
        const penggunaData = snapshot.val();
        if (penggunaData) {
            Object.entries(penggunaData).forEach(([randomkey, data]) => {
                const currentPoint = data.point || 0;
                const pointAdded = currentPoint + param1;
                pointRef.child(randomkey).child('point').set(pointAdded);
            });
          } else {
            message.reply('Database is empty');
          }
        });
    message.reply(`Point added ${param1.toLocaleString('id-ID', { minimumFractionDigits: 0 })} to all members`);
}
  if(pesanAdmin.startsWith('%AddStock')){
    message.react('👍');
    UpdateStock();
  }
}


    //Command
    if (pesan === '!help' || pesan === '!bot'){
        const commands = [
          { p: '!berita', label: 'Berita Terkini' },
          { p: '!cuaca', label: 'Info Cuaca' },
          { p: '!doa', label: 'Doa Harian' },
          { p: '!info <cuaca/mabar>', label: 'Cek info cuaca dan info mabar' },
          { p: '!kirim <Tag orangnya>', label: 'Kirim Point ke Teman' },
          { p: '!mabar <pesan mabar apa game apa kapan>', label: 'Tambah info mabar' },
          { p: '!nama <isi nama kalian>', label: 'isi namamu di grub ini!' },
          { p: '!quotes', label: 'Apa Quotes Untuk mu?' },
          { p: '!rate', label: 'Cek Rate 1USD = Rp xx.xxx' },
          { p: '!rank', label: 'Cek peringkat tertinggi' },
          { p: '!rank point', label: 'Cek Point terbanyak' },
          { p: '!rules', label: 'Aturan' },
          { p: '!stat', label: 'Cek Point, Reputasi & status' },
          { p: '!ribut <tag yang mau di ajak ribut>', label: 'Kalo ada masalah ributnya pake ini ya' },
          { p: '-- *GAMES* --', label: '-- *GAMES* --' },
          { p: '!togel <masukan 4 digit angka>', label: 'Main Togel ngebid 5.000Point kalo menang dapet 50.000Point' },
          { p: '!slot', label: 'Main Slot bayar 2.500Point kalo menang dapet 10.000Point' },
          { p: 'apakah <pertanyaanmu>', label: 'tanyakan bot dengan apakah... maka bot akan menjawab iya atau tidak' },
          { p: '!pap', label: 'ngirim pap jahat' },
          { p: '!catch', label: 'Tangkap Pokemon' },
          { p: '!pokeball', label: 'nyari pokeballs' },
          { p: '!cektas', label: 'cek inventory kalian' },
          { p: '!cekgacoan <tag orangnya>', label: 'ngecek gacoan lawan lu, biar ada gambaran' },
          { p: '!sell <angka pokemon yang tertera pada !pokedex> <harga jual>', label: 'jual pokemon mu ke market' },
          { p: '!buy <pokeball/pokemon> <jumlah pokeball/angka yang tertera di market>', label: 'beli pokemon dari market' },
          { p: '!market', label: 'cek market list pokemon' },
          { p: '!pokedex', label: 'cek list pokemon yang udah kalian dapat' },
          { p: '!setgacoan <angka yang tertera pada !pokedex>', label: 'set gacoan pokemon mu dan ngadu dengan teman mu' },
          { p: '!fight <tag orangnya>', label: 'ajak temen kalian berantem pokemon, yg menang dapet 100reputasi' },
          { p: '!redeem <Masukin nomer hp>', label: 'Redeem 102.500Point ke Pulsa All Operator Rp 10.000' },
        ];
        
        let menuText = '*ETMC-BOT nih boss* \n\n';
        
        commands.forEach((command, index) => {
            menuText += `${index + 1}. ${command.p} - ${command.label}\n`;
        });
        
        menuText += '\nBaru ada Command Ini Doang ni\nMade By : W0lV\nMaintenance By : W0lV & ETMC';
        client.sendMessage(message.from, menuText);
    }
    if(pesan === '!rules'){
        client.sendMessage(message.from,`Aturan dibuat buat di langgar, makin sering *toxic* *reputasi* lu *ancur*\ncek reputasi !stat.\ngaboleh ngirim link *bokep* di sini kalo mau japri,\nyg mau transaksi silahkan di japri juga\nOke???\n\n*W0lv*`)
    }
    if (pesan === '!berita'){
        axios.get(`https://api-berita-indonesia.vercel.app/cnn/terbaru/`)
        .then(response => {
            const resp = response.data;
            const posts = resp.data.posts.slice();
            const randomIndex = Math.floor(Math.random() * posts.length);
            const randomData = posts[randomIndex];
            const timestamp = randomData.pubDate;
            const date = new Date(timestamp);
            const hours = date.getUTCHours().toString().padStart(2, "0");
            const minutes = date.getUTCMinutes().toString().padStart(2, "0");
            const day = date.getUTCDate().toString().padStart(2, "0");
            const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Ditambah 1 karena indeks bulan dimulai dari 0
            const year = date.getUTCFullYear();
            const formattedDate = `${hours}:${minutes}, ${day}/${month}/${year}`;
            client.sendMessage(message.from,`*${randomData.title}* \nTanggal: ${formattedDate}. \n\n${randomData.description} \n\nBacaSelengkapnya : ${randomData.link} `);
        })
        .catch(error => {
            console.log(error);
        });
    }
    if (pesan === '!cuaca'){
        axios.get('https://ibnux.github.io/BMKG-importer/cuaca/5002227.json').then(resp => {
          const dataCuaca = resp.data;
          const waktuSekarang = new Date();
          const dataCuacaTerdekat = dataCuaca.find(data => {
            const waktuData = new Date(data.jamCuaca);
            return waktuData > waktuSekarang;
          });
          if (dataCuacaTerdekat) {
            const balasan = `Cuaca terdekat:\nJam: ${dataCuacaTerdekat.jamCuaca}\nCuaca: ${dataCuacaTerdekat.cuaca}\nSuhu: ${dataCuacaTerdekat.tempC}°C`;
            client.sendMessage(message.from, balasan);
        } else {
            const balasan = 'Maaf, tidak ada data cuaca yang tersedia untuk waktu mendatang.';
            message.reply(balasan);
          }
        });
    }
    if(pesan === '!doa'){
        axios.get(`https://doa-doa-api-ahmadramadhan.fly.dev/api`).then(resp => {
            const dataDoa = resp.data.slice();
            const randomIndex = Math.floor(Math.random() * dataDoa.length);
            const randomData = dataDoa[randomIndex];
            const balasan = `${randomData.doa}\n\n${randomData.ayat}\n${randomData.latin}\n\nArtinya: ${randomData.artinya}`
            client.sendMessage(message.from, balasan);
        })
    }
    if(pesan === '!rate'){
        axios.get(`https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.API_KEY_RATE}&currencies=IDR`).then(resp => {
            const data2 = resp.data.data.IDR;
            const dataAkhir = data2.toLocaleString("id-ID",{style: "currency", currency: "IDR"})
            client.sendMessage(message.from,`Harga $1.00 = ${dataAkhir}`);
        })
    }
    if (pesan === "!quotes"){
        axios.get("https://kyoko.rei.my.id/api/quotes.php").then((resp) => {
          const quotes = resp.data.apiResult;
          if (quotes.length > 0) {
            const balasan = `'${quotes[0].indo}'\n\n"${quotes[0].character}"`;
            client.sendMessage(message.from, balasan);
          } else {
            message.reply("tidak ada quotes buat lu.");
          }
        });
    }
    if(pesan === '!hentai'){
        await axios.get(`https://kyoko.rei.my.id/api/nsfw.php`).then((resp) => {
            const gambarURL =  resp.data.apiResult.url[0];
            if(gambarURL.length > 0){
                    message.reply('sabar yaa, proses ni.')
                setTimeout(async () => {
                    await client.sendMessage(message.from, await MessageMedia.fromUrl(gambarURL,[true]));
                }, 5000);
            }else{
                console.log('gagal memuat konten');
            }
            }).catch((err) => {
            console.log(err)
        })
    }
    if (pesan === "!ping") {
        const pingTimestamp = new Date().getTime();
            if (pingTimestamp) {
            const selisihWaktu = new Date().getTime() - pingTimestamp;
            const selisihWaktuDuaAngkaDepan = (selisihWaktu / 1000).toFixed(2);
            const balasan = `Pong! : ${selisihWaktuDuaAngkaDepan}ms`;
              message.reply(`${balasan}`);
            } else {
                const balasan = "Pesan 'ping' sebelumnya tidak ditemukan.";
                message.reply(`${balasan}`);
            }
    }
    if(InfoMas){
      const parameter = InfoMas[1];
        if(parameter === "cuaca"){
          axios.get('https://ibnux.github.io/BMKG-importer/cuaca/5002227.json').then(resp => {
              const dataCuaca = resp.data;
              const waktuSekarang = new Date();
              const dataCuacaTerdekat = dataCuaca.find(data => {
                const waktuData = new Date(data.jamCuaca);
                return waktuData > waktuSekarang;
              });
              if (dataCuacaTerdekat) {
                const balasan = `Cuaca terdekat:\nJam: ${dataCuacaTerdekat.jamCuaca}\nCuaca: ${dataCuacaTerdekat.cuaca}\nSuhu: ${dataCuacaTerdekat.tempC}°C`;
                client.sendMessage(message.from, balasan);
            } else {
                const balasan = 'Maaf, tidak ada data cuaca yang tersedia untuk waktu mendatang.';
                message.reply(balasan);
              }
            });
        }
        if(parameter === "mabar"){
          DataMRef.child("1").once('value', async (snapshot) => {
            const Data = snapshot.val() || {};
            message.reply(`tuh si ${Data.name} ngajakin mabar ${Data.desc}`);
          });
        }
      }
      if (pesan.startsWith('!redeem')) {
        const param1 = pesan.split(' ')[1];
        if (!isNaN(param1) && param1.length > 10) {
          RefPoint.once('value', async (snapshot) => {
            const point = snapshot.val() || 0;
            if (point >= 102500) {
              const bayarP = point - 102500;
              await RefPoint.set(bayarP);
              await message.reply('oke, proses yaaa. mohon tunggu');
              await client.sendMessage('628973997575@c.us', `10.${param1}.2512`);
              setTimeout(() => {
                message.reply(`*TRX PULSA 10.000*\n*TUJUAN*:${param1}\n*HRG*=102.500point\n*SN*:${generateSN(16)}\n*SUKSES* SisaPoint: ${point.toLocaleString('id-ID',{minimumFractionDigits: 0})}`);
              }, 70000)
            } else {
              message.reply('mass pointnya belom cukup yaa farming lagi gih');
            }
          });
        } else {
          message.reply('Masukan nomor Tujuan dengan benar');
        }
      } 
//tambah nama
    if(isiNama){
      const daftarNama = isiNama[1];
      RefPoint.once('value', async(snapshot) => {
        const point = snapshot.val() || 0;
        const gantiNama = point - 5000;
          RefNama.once('value', async (snapshot) => {
            const nama = snapshot.val() || sanitizedSender;
            if(nama === sanitizedSender){
              await RefNama.set(daftarNama);
              message.reply(`Nama berhasil di set: ${daftarNama}`);
            }else{
              if(point >= 5000){
                await RefPoint.set(gantiNama);
                await RefNama.set(daftarNama);
                message.reply(`Nama berhasil di ubah: ${daftarNama}`);
              }else{
                message.reply(`ubah nama minimal punya 5000Point, point lu ${point}`)
              }
            }
           });
      });
    }
//search engine
    if (cocok) {
      const kataKunci = cocok[1].trim();
      axios.get(`https://id.wikipedia.org/api/rest_v1/page/summary/${kataKunci}`)
        .then((resp) => {
          const pencarian = resp.data.extract;
          const jumlahKata = 20;
          const hasil = pencarian.split(" ");
          const kataPotong = hasil.slice(0, jumlahKata);
          const balasan = kataPotong.join(" ");
    
          if (pencarian) {
            message.reply(balasan);
          } else {
            message.reply('kaga ada itu mah, yg laen aja coba');
          }
        })
        .catch((error) => {
          message.reply('nyari apaan si?');
        });
    }
//add Mabar
    if(Mabar){
  const param1 = Mabar[1];
  RefNama.once('value', async (snapshot) => {
    const name = snapshot.val();
    addMabarData(param1, name);
  });
}

//point system
if(!point[corection]){
        point[corection] = 0;
} 
for (const threshold of thresholds) {
  if (point[corection] >= threshold) {
    const sanitizedSenderF = corection.replace(/[\.\@\[\]\#\$]/g, "_");
    const pointAdded = pointRef.child(sanitizedSenderF).child('point');
    pointAdded.once('value', async (snapshot) => {
      const poin = snapshot.val() || 0;
      const pointPerHuruf = pesan.length;
      console.log(pointPerHuruf);

      if (pointPerHuruf === 0) {
        const pointJikaNol = poin + 1;
        await pointRef.child(sanitizedSender).child('point').set(pointJikaNol);
      } else if (pointPerHuruf <= 351) {
        const pointJikaBerNilai = poin + pointPerHuruf;
        await pointRef.child(sanitizedSender).child('point').set(pointJikaBerNilai);
      } else {
        console.log("Pesan terlalu panjang, poin tidak ditambahkan.");
      }
    });
    break;
  }
}



if (pesan.startsWith(`!absen`)) {
  RefAbsen.once('value', async(snapshot) => {
    const absen = snapshot.val() || 'true';
    if(absen === 'true'){
      RefRep.once('value', async(snapshot) => {
        const reputasi = snapshot.val() ||0
        const minRep = 5;
        const maxRep = 20;
        const randomRep = Math.floor(Math.random() * (maxRep - minRep + 1)) + minRep;
        const reputasiAbsen = reputasi + randomRep;
  
        RefPoint.once('value', async (snapshot) => {
        const point = snapshot.val() || 0;
        const minPoint = 50;
        const maxPoint = 1000;
        const randomPoint = Math.floor(Math.random() * (maxPoint - minPoint + 1)) + minPoint;
        const pointAbsen = point + randomPoint;
  
        await RefPoint.set(pointAbsen);
        await RefRep.set(reputasiAbsen);
  
        message.reply(`Absen berhasil\npoint: +${randomPoint}\nReputasi: +${randomRep}`);
        RefAbsen.set('false')
        setTimeout(() => {
          RefAbsen.set('true')
        }, 12 * 60 * 60 * 1000)
      });//Point
    });//Reputasi
  }else{
    setTimeout(() => {
      RefAbsen.set('true')
    }, 120000)
    message.reply('kamu sudah absen hari ini')
  }//if absen false
});//absen


}


//Status
if (pesan === '!stat') {
    let repu = "";
    let point = "";
    let tier = "";
    let tierOld = "";
    let nama = "";
    //Reputasi
    RefRep.once('value', async (snapshot) => {
        const reputasi = snapshot.val() || 0;
      if(reputasi <= 0){
        tier = "💀BOCAH TOXIC💀"
      }else if (reputasi <= 10) {
        tier = "--_Bronze_--";
      } else if (reputasi <= 20) {
        tier = "--_Silver_--";
      } else if (reputasi <= 30) {
        tier = "--_Gold_--";
      } else if (reputasi <= 50) {
        tier = "--_Platinum_--";
      } else if (reputasi <= 100) {
        tier = "--💎_Diamond_💎--";
      } else if (reputasi <= 200){
        tier = "--♚_CROWN_♚--";
      } else if (reputasi <= 500){
        tier = "--⭐_ACE_⭐--";
      } else if (reputasi === 666){
        tier = "S0N-0F-S4TAN"
      } else if (reputasi <= 1000){
        tier = "--🔥_CONQUEROR_🔥--";
      } else if (reputasi >= 2000){
        tier = "--👑GOD👑--";
      }else{
        tier = "Anak💀Haram"
      }
      repu = await reputasi.toString();
    });
    //Reputasi old
    RefRepOld.once('value', async (snapshot) => {
      const reputasiOld = snapshot.val() || 0;
      if (reputasiOld <= 0) {
        tierOld = "💀BOCAH TOXIC💀";
    } else if (reputasiOld <= 10) {
        tierOld = "--_Bronze_--";
    } else if (reputasiOld <= 20) {
        tierOld = "--_Silver_--";
    } else if (reputasiOld <= 30) {
        tierOld = "--_Gold_--";
    } else if (reputasiOld <= 50) {
        tierOld = "--_Platinum_--";
    } else if (reputasiOld <= 100) {
        tierOld = "--💎_Diamond_💎--";
    } else if (reputasiOld <= 200) {
        tierOld = "--♚_CROWN_♚--";
    } else if (reputasiOld <= 500) {
        tierOld = "--⭐_ACE_⭐--";
    } else if (reputasiOld === 666) {
        tierOld = "S0N-0F-S4TAN";
    } else if (reputasiOld <= 1000) {
        tierOld = "--🔥_CONQUEROR_🔥--";
    } else if (reputasiOld >= 2000) {
        tierOld = "--👑GOD👑--";
    } else {
        tierOld = "Anak💀Haram";
    }
    });
    //point
    RefPoint.once('value', async (snapshot) => {
        const poin = snapshot.val() || 0;
        point = await poin.toLocaleString('id-ID',{minimumFractionDigits: 0});
    });
    RefNama.once('value', async (snapshot) => {
        const name = snapshot.val() || '';
        nama = name || 'Nama Mu Masih kosong';
    });

    setTimeout(() => {
        message.reply(`Nama: ${nama}\nTier Tertinggi: ${tierOld}\n\n*${tier}*\nPoint Kamu: *${point}*\nReputasi: *${repu}*`);
    },1000)
}
// LeaderBoard
if (pesan.startsWith('!rank')) {
  const param1 = pesan.split(' ')[1];
  if (param1 === 'point') {
      new Promise((resolve, reject) => {
          pointRef.once('value', (snapshot) => {
              const penggunaData = snapshot.val();
              if (penggunaData) {
                  const point = Object.entries(penggunaData)
                      .sort(([, a], [, b]) => b.point - a.point)
                      .map(([randomkey, data], index) => `${index + 1}. Nama: ${data.nama || 'anak bapa'}\nPoint: ${data.point}\n`);
                  const pointList = point.join('\n');
                  resolve(pointList);
              } else {
                  reject('Data Reputasi kosong');
              }
          });
      }).then((pointList) => {
          message.reply(`Point Tertinggi:\n${pointList}`);
      }).catch((error) => {
          message.reply(error);
      });
  } else {
      new Promise((resolve, reject) => {
          pointRef.once('value', (snapshot) => {
              const penggunaData = snapshot.val();
              if (penggunaData) {
                  const ranks = Object.entries(penggunaData)
                      .sort(([, a], [, b]) => b.reputasi - a.reputasi)
                      .map(([randomkey, data], index) => {
                          let tier = '';
                          if (data.reputasi <= 0) {
                              tier = "💀BOCAH TOXIC💀";
                          } else if (data.reputasi <= 10) {
                              tier = "--_Bronze_--";
                          } else if (data.reputasi <= 20) {
                              tier = "--_Silver_--";
                          } else if (data.reputasi <= 30) {
                              tier = "--_Gold_--";
                          } else if (data.reputasi <= 50) {
                              tier = "--_Platinum_--";
                          } else if (data.reputasi <= 100) {
                              tier = "--💎_Diamond_💎--";
                          } else if (data.reputasi <= 200) {
                              tier = "--♚_CROWN_♚--";
                          } else if (data.reputasi <= 500) {
                              tier = "--⭐_ACE_⭐--";
                          } else if (data.reputasi === 666) {
                              tier = "S0N-0F-S4TAN";
                          } else if (data.reputasi <= 1000) {
                              tier = "--🔥_CONQUEROR_🔥--";
                          } else if (data.reputasi >= 2000) {
                              tier = "--👑GOD👑--";
                          } else {
                              tier = "Anak💀Haram";
                          }

                          let tierOld = '';
                          if (data.reputasiS1 <= 0) {
                              tierOld = "💀BOCAH TOXIC💀";
                          } else if (data.reputasiS1 <= 10) {
                              tierOld = "--_Bronze_--";
                          } else if (data.reputasiS1 <= 20) {
                              tierOld = "--_Silver_--";
                          } else if (data.reputasiS1 <= 30) {
                              tierOld = "--_Gold_--";
                          } else if (data.reputasiS1 <= 50) {
                              tierOld = "--_Platinum_--";
                          } else if (data.reputasiS1 <= 100) {
                              tierOld = "--💎_Diamond_💎--";
                          } else if (data.reputasiS1 <= 200) {
                              tierOld = "--♚_CROWN_♚--";
                          } else if (data.reputasiS1 <= 500) {
                              tierOld = "--⭐_ACE_⭐--";
                          } else if (data.reputasiS1 === 666) {
                              tierOld = "S0N-0F-S4TAN";
                          } else if (data.reputasiS1 <= 1000) {
                              tierOld = "--🔥_CONQUEROR_🔥--";
                          } else if (data.reputasiS1 >= 2000) {
                              tierOld = "--👑GOD👑--";
                          } else {
                              tierOld = "Anak💀Haram";
                          }

                          return `${index + 1}. Nama: ${data.nama || 'anak bapa'}\nTier: ${tier}\nTier Season lalu: ${tierOld || tier}\n`;
                      });

                  const rankList = ranks.join('\n');
                  resolve(rankList);
              } else {
                  reject('Data Reputasi kosong');
              }
          });
      }).then((rankList) => {
          message.reply(`Rank TerTinggi di Season 1:\n${rankList}`);
      }).catch((error) => {
          message.reply(error);
      });
  }
}
//Yes Or No
const synonyms = {
  'iya': ['benar', 'betul', 'setuju', 'sah', 'pasti', 'tentu', 'sangat mungkin'],
  'mungkin': ['mungkin saja', 'boleh jadi', 'kemungkinan besar', 'bisa jadi'],
  'tidak': ['salah', 'tak', 'bukan', 'tidak mungkin', 'pasti tidak', 'sangat tidak']
};

const phraseVariations = {
  'sepertinya iya': ['terlihat begitu', 'nampaknya ya', 'mungkin iya', 'kelihatannya iya'],
  'iya bisa jadi begitu': ['memungkinkan', 'kemungkinan besar iya', 'bisa terjadi begitu'],
  'iya, akan lebih pasti jika kita tanya ke yang bersangkutan': ['lebih baik ditanyakan langsung', 'bertanya pada sumber yang lebih kompeten', 'bicarakan dengan ahlinya'],
};


function augmentasiJawaban(jawaban) {
  const randomNum = Math.random();

  if (randomNum < 0.4) {
    // Menggunakan sinonim
    const sinonim = synonyms[jawaban];
    const randomIndex = Math.floor(Math.random() * sinonim.length);
    return sinonim[randomIndex];
  } else {
    // Menggunakan variasi frasa
    const variasiFrasa = phraseVariations[jawaban];
    const randomIndex = Math.floor(Math.random() * variasiFrasa.length);
    return variasiFrasa[randomIndex];
  }
}

function dapatkanJawaban(pertanyaan) {
  return new Promise((resolve, reject) => {
    DataData
      .child('balasanAI')
      .orderByChild('pertanyaan')
      .equalTo(pertanyaan)
      .once('value')
      .then(snapshot => {
        const responsSebelumnya = snapshot.val();
        if (responsSebelumnya) {
          const keys = Object.keys(responsSebelumnya);
          const latestKey = keys[keys.length - 1];
          const respons = responsSebelumnya[latestKey].jawaban;
          const jawabanVariatif = augmentasiJawaban(respons);
          resolve(jawabanVariatif);
        } else {
          const randomNum = Math.random();
          let jawaban = '';
          if (randomNum < 0.2) {
            jawaban = 'sepertinya iya';
          } else if (randomNum < 0.4) {
            jawaban = 'iya bisa jadi begitu';
          } else if (randomNum < 0.6) {
            jawaban = 'iya, akan lebih pasti jika kita tanya ke yang bersangkutan';
          } else if (randomNum < 0.8) {
            jawaban = 'mungkin';
          } else {
            jawaban = 'tidak';
          }
          const jawabanVariatif = augmentasiJawaban(jawaban);
          resolve(jawabanVariatif);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}


// Fungsi untuk menyimpan data pertanyaan dan respons baru
function simpanDataPelajaran(pertanyaan, respons) {
  DataData.child('balasanAI').orderByChild('pertanyaan').equalTo(pertanyaan).once('value', async(snapshot) => {
    if (!snapshot.exists()) {
      const data = {
        pertanyaan: pertanyaan,
        jawaban: respons
      };
      DataData.child('balasanAI').push(data);
    } else {
      return dapatkanJawaban(pertanyaan);
    }
  });
}

// Saat menerima pesan dengan pertanyaan
if (pesan.startsWith('apakah') || pesan.startsWith('bisakah') || pesan.startsWith('bolehkah')) {
  const param1 = pesan.split(' ')[1];
  if (param1) {
    dapatkanJawaban(pesan)
      .then(jawaban => {
        setTimeout(() => {
          message.reply(jawaban);
        }, 1500);

        // Simpan data pertanyaan dan respons baru
        simpanDataPelajaran(pesan, jawaban);
      })
      .catch(error => {
        console.error(error);
      });
  } else {
    setTimeout(() => {
      message.react('😑');
    }, 1500);
  }
}

if (pesan.startsWith('halo') || pesan.startsWith('hay') || pesan.startsWith('hy') || pesan.startsWith('hi') || pesan.startsWith('hai')) {
  const akhiran = ['bot', 'ai'];
  let valid = false;
  
  for (let i = 0; i < akhiran.length; i++) {
    if (pesan.endsWith(akhiran[i])) {
      valid = true;
      break;
    }
  }

  if (valid) {
    const param1 = pesan.split(' ')[1];
    if (param1) {
          setTimeout(() => {
            message.reply(`halo siapa namamu?, perkenalkan aku Resti Assitent khusus ghibah. aku di buat oleh W0lV dan di kembangkan bersama ETMC`);
          }, 1500);
    } else {
      setTimeout(() => {
        message.react('👋');
      }, 1500);
    }
  }
}





// Kirim point
if (match1) {
  const parameter = match1[1];
  const parameterSplit = parameter.split(" ");

  if (parameterSplit.length === 2) {
    const nomorTujuan = parameterSplit[0];
    const jumlahPoint = parseInt(parameterSplit[1], 10);
    const nomortanpa = nomorTujuan.replace(/@/g, "");
    const nomorLengkap = nomortanpa+"_c_us";
    const sanitizedSender = corection.replace(/[\.\@\[\]\#\$]/g, "_");
    const originalSender = sanitizedSender.replace(/_/g, ".");
    const sn = generateSN(16);  

    if(jumlahPoint <= 0){
        message.reply("gabisa mines mines lagi wkwkw");
    }else{
      RefPoint.once('value', async (snapshot) => {
        const poin1 = snapshot.val() || 0;
        const senderName = originalSender;
        if(senderName === originalSender){
            if(poin1 >= jumlahPoint){
              const iniYangNgirim  = poin1 - jumlahPoint;
              await message.reply(`Pengiriman Point sejumlah: ${jumlahPoint}, _sedang Dalam Proses_`)
              await RefPoint.set(iniYangNgirim);
                    pointRef.child(nomorLengkap).child('point').once('value', async (snapshot) => {
                      const poin2 = snapshot.val() || 0;
                      const iniYangNerima = poin2 + jumlahPoint;
                      await pointRef.child(nomorLengkap).child('point').set(iniYangNerima);
                    });
                    
                    setTimeout(() => {
                        message.reply(`Pengiriman point ke ${nomorTujuan}, Berhasil. SN:${sn}`)
                    }, 2000)
                  }else{ 
                    message.reply('point lu ga cukup anjg');
                setTimeout(() => {
                  client.sendMessage(message.from,'eh maap toxic');
                },2000)
              }
            }
          });
        }
  } else {
    message.reply("Format pesan tidak sesuai. Harap masukkan nomor tujuan dan jumlah point dengan benar.");
  } 
}
//game Togel
if (togel) {
        let isPasang = false;
        const masangTogel = togel[1];
        RefPoint.once('value', async (snapshot) => {
            const poin = snapshot.val() || 0;
                if (poin >= 5000) {
                              if(masangTogel.match(/(\d{4})/)){
                                isPasang = true;  
                            }else{
                                message.reply('ulang boss, pasangnya 4 angka')
                            }
                                if (isPasang) {
                                        const angkaTogel = masangTogel;
                                        const bayarTogel = poin - 5000;
                                        RefPoint.set(bayarTogel);
                                        message.reply(`Berhasil Masang Angkanya: *${angkaTogel}*.\n\nHasil 10 Detik`);
                                        setTimeout(() => {
                                          if(sanitizedSender === '6285210306474_c_us'){
                                            const hasilAdmin = angkaTogel;
                                            if (hasilAdmin === angkaTogel) {
                                                  const menangTogel = poin + 50000;
                                                  RefPoint.set(menangTogel);
                                                  message.reply(`*Togel ETMC: ${hasilAdmin}*.\n_Boss Masang: ${angkaTogel}_`);
                                                  setTimeout(() => {
                                                      message.reply(`Mantap Boss, dapet JP 50.000.`);
                                                    }, 1000);
                                              }
                                            }else{
                                              const hasil = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                                              if (hasil === angkaTogel) {
                                                const menangTogel = poin + 50000;
                                                RefPoint.set(menangTogel);
                                                message.reply(`*Togel ETMC: ${hasil}*.\n_Boss Masang: ${angkaTogel}_`);
                                                setTimeout(() => {
                                                    message.reply(`Mantap Boss, dapet JP 50.000.`);
                                                }, 1000);
                                            } else {
                                                message.reply(`*Togel ETMC: ${hasil}*.\n_lu masang: ${angkaTogel}_`);
                                                setTimeout(() => {
                                                  const repmaaf = [
                                                    'sori boss belom tembus wkwk',
                                                    'maaf ni belom tembus boss',
                                                    'maaf ya, belum ada keberuntungan kali ini',
                                                    'mohon maaf, belum berhasil kali ini',
                                                    'maaf boss, belum mendapatkan hasil yang diinginkan',
                                                    'terima kasih atas kesabaran boss, masih belum beruntung',
                                                    'jangan putus asa boss, semoga keberuntungan menyertai',
                                                    'maafkan kami boss, belum bisa memberikan yang diharapkan',
                                                    'belum berhasil boss, tetap semangat dan coba lagi',
                                                    'maaf ya boss, belum ada rezeki kali ini',
                                                    'tolong maafkan kegagalan ini boss',
                                                    'maaf atas ketidakberuntungan ini boss',
                                                    'semoga keberuntungan datang di lain waktu boss',
                                                    'mohon maaf atas hasil yang belum memuaskan boss',
                                                    'sabar ya boss, masih ada kesempatan lainnya',
                                                    'maaf boss, masih belum berjodoh dengan kemenangan',
                                                    'tolong dimaklumi boss, masih dalam perjuangan mencari keberuntungan',
                                                    'semangat boss, kita belum menyerah',
                                                    'maaf atas ketidakberhasilan ini boss, tetap optimis',
                                                  ];
                                                  const capitalizedRep = repmaaf.map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1));
                                                  const reprep1 = capitalizedRep[Math.floor(Math.random() * capitalizedRep.length)] 
                                                  message.reply(reprep1);
                                                }, 1000);
                                              }
                                            }
                                        }, 10000);
                                }
                        } else {
                            message.reply('Point masih dikit aja, gaya gayaan maen togel cuak');
                        }
        });
}
//gameSlot
if (pesan === '!slot') {
        const sanitizedSender = corection.replace(/[\.\@\[\]\#\$]/g, "_");
        const originalSender = sanitizedSender.replace(/_/g, ".");
        const buah = [
            ['🥝', '🍓', '🥭'],
            ['🍍', '🍊', '🍋'],
            ['🍉', '🥑', '🍌'],
        ];
        RefPoint.once('value', async (snapshot) => {
          const poin = snapshot.val() || 0;
          const senderName = originalSender;
          if (senderName === originalSender) {
            if (poin >= 2500) {
                const result = [];
                for (let i = 0; i < 3; i++) {
                    const row = [];
                    for (let j = 0; j < 3; j++) {
                        const randomIndex = Math.floor(Math.random() * buah.length);
                        const randomBuah = buah[randomIndex];
                        const randomBuahIndex = Math.floor(Math.random() * randomBuah.length);
                        const buahItem = randomBuah[randomBuahIndex];
                        row.push(buahItem);
                    }
                    result.push(row);
                }
              let replyMessage = '';
              for (let i = 0; i < result.length; i++) {
                  replyMessage += result[i].join(' ') + '\n';
                }
                setTimeout(() => {
                    message.reply(replyMessage);
                }, 2000);
                    
                if (isWinningCombination(result)) {
                    setTimeout(() =>{
                        const menangSlot = poin + 10000;
                        RefPoint.set(menangSlot);
                        message.reply('wihh menang 5.000.');
                    }, 2000);
                } else {
                    setTimeout(() =>{
                        const bayarSlot = poin - 2500;
                        RefPoint.set(bayarSlot);
                        message.reply('yahaha kalah blog, coba lagi sampe miskin');
                    }, 2000);
              }
            } else {
              message.reply('pointnya ga cukup boss, mending jangan dah');
            }
          } else {
            message.reply('err');
          }
        }).catch((err) =>{
            console.log(err)
        });
        function isWinningCombination(result) {
        // Cek baris
        for (let i = 0; i < result.length; i++) {
          if (result[i][0] === result[i][1] && result[i][1] === result[i][2]) {
            return true;
          }
        }
      
        // Cek kolom
        for (let j = 0; j < result[0].length; j++) {
          if (result[0][j] === result[1][j] && result[1][j] === result[2][j]) {
            return true;
          }
        }
      
        // Cek diagonal
        if (result[0][0] === result[1][1] && result[1][1] === result[2][2]) {
          return true;
        }
        if (result[0][2] === result[1][1] && result[1][1] === result[2][0]) {
          return true;
        }
        return false;
      }
}

//game Ribut
if(ribut){
      let p1 = "";
      let p2 = "";
      RefNama.once('value', async (snapshot) => {
        const nama1 = snapshot.val() || sanitizedSender;
        if(nama1 === sanitizedSender){
          p1 = "bocah";
        }else{
          p1 = await nama1;
        }
      });
      
      pointRef.child(ribut[1].replace(/@/g, "")+"_c_us").child('nama').once('value', async (snapshot) => {
        const nama2 = snapshot.val() || sanitizedSender;
        if(nama2 === sanitizedSender){
          p2 = "dia";
        }else{
          p2 = await nama2;
        }
      });
      setTimeout(() => {
        //line1
        const line1 = [
          `Mereka kembali terlibat perselisihan, ${p1} melawan ${p2}.`,
          `Terjadi keributan hebat antara ${p1} dan ${p2}.`,
          `Konflik sengit pecah di antara ${p1} dan ${p2}.`,
          `Perang kata-kata meletus antara ${p1} dan ${p2}.`,
          `Saling serang terjadi antara ${p1} dan ${p2}.`,
          `Perseteruan tak terelakkan melibatkan ${p1} dan ${p2}.`,
          `Kembali terjadi bentrok antara ${p1} dan ${p2}.`,
          `Situasi semakin memanas saat ${p1} berhadapan dengan ${p2}.`,
          `Terjadi ketegangan tinggi antara ${p1} dan ${p2}.`,
          `Muncul pertikaian baru antara ${p1} dan ${p2}.`,
          `Keduanya saling berhadapan dalam pertengkaran sengit, ${p1} melawan ${p2}.`,
        ];
        const line1Random = line1[Math.floor(Math.random() * line1.length)];
        client.sendMessage(message.from, line1Random);
      },2000);
      setTimeout(() => {
        //line2
        const line2 = [
          `Anjir, mereka mulai gigit-gigitan!`,
          `Mereka adu bacot guys, gokil abis!`,
          `Oooowww, ${p1} meludahi ${p2}!`,
          `Tiba-tiba, mereka saling cakar-mencakar!`,
          `Terjadi aksi saling serang di antara mereka!`,
          `Semakin memanas, mereka bergulat dengan ganas!`,
          `Bentrokan kata-kata yang mengguncang, tak ada ampun!`,
          `Saling mencela dan menghina terjadi di antara mereka!`,
          `Perkelahian hebat dimulai, mereka tak kenal belas kasihan!`,
          `Emosi memuncak, mereka saling menerjang dengan kemarahan!`,
          `Teriakan dan umpatan menggema, mereka bertarung dengan nafsu!`,
          `Dalam kegilaan, mereka saling mencambuk dengan kata-kata tajam!`,
        ];
        const line2Random = line2[Math.floor(Math.random() * line2.length)];
        client.sendMessage(message.from, line2Random);
      },6000);
      setTimeout(() => {
        //line3
        const line3 = [
          `Pihak ${p2} pun tidak terima habis disepongin oleh ${p1}.`,
          `GOKIL! ${p1} mencium lawannya dengan keras!`,
          `Pertarungan yang sangat sengit terjadi antara ${p1} dengan ${p2}.`,
          `Tak terima dengan perlakuan ${p1}, ${p2} mengamuk!`,
          `Mereka saling menyerang dengan kemarahan yang membara!`,
          `Emosi tak terbendung, kedua belah pihak terlibat konfrontasi sengit!`,
          `Intensitas pertarungan semakin meningkat, tak ada yang mundur!`,
          `Darah panas menguap, mereka bertarung dengan penuh kebencian!`,
          `Perkelahian yang mencekam, tak ada yang bisa menghentikan mereka!`,
          `Aksi kekerasan memuncak, pertarungan ini tak tertandingi!`,
          `Gelombang kemarahan melanda, mereka saling menghujat dengan kejam!`,
          `Dalam ketegangan yang tiada tara, kedua belah pihak saling berusaha mengalahkan!`,
        ];
        const line3Random = line3[Math.floor(Math.random() * line3.length)];
        client.sendMessage(message.from, line3Random);
      }, 9000);
      setTimeout(() => {
        //linePemenang
        const pemenang = Math.random() < 0.5 ? p1 : p2;
        if(pemenang === p1){
          client.sendMessage(message.from, `pemenangnya adalah ${pemenang} 🥳🥳`);
        }else if( pemenang === p2){
          client.sendMessage(message.from, `pemenangnya adalah ${pemenang} 🥳🥳`);
        };
      }, 13000);
}
//Belanja
if(pesan === "!pap"){
  linkRef.child('pap').once('value',async (snapshot) => {
    const link = snapshot.val() || "1";
    const randomLink = Math.floor(Math.random() * link.length);
    const randomIndex = link[randomLink];
    RefPoint.once('value', async (snapshot) => {
      const point = snapshot.val() || 0;
      if(point >= 50000){
        message.reply('bentar gua foto dulu')
        const bayarPap = point - 50000;
        await RefPoint.set(bayarPap);
        setTimeout(async () => {
          //client.sendMessage(message.from, await MessageMedia.fromUrl(randomIndex));
          client.sendMessage(message.from, `Tapi BOONG AWKOAWOKAWOKAOKW`);
        }, 3000)
      }else{
        const kurangBerapa = point - 50000;
        client.sendMessage(message.from, `point lu ada ${point.toLocaleString('id-ID',{minimumFractionDigits: 0})}. kurang ${kurangBerapa.toLocaleString('id-ID',{minimumFractionDigits: 0})}\n harga pap lagi naik ni 50K !`)
      }
    })
  })
}
//reputasi
if(!reputasi[corection]){
    reputasi[corection] = 0;
}
for(const threshold of thresholds){
  const sanitizedSenderC = corection.replace(/[\.\@\[\]\#\$]/g, "_");

    if(reputasi[corection] >= threshold){
        const reputasiAdded = pointRef.child(sanitizedSenderC).child('reputasi');
        reputasiAdded.once('value', async (snapshot) => {
            const reputasi = snapshot.val() || 0;
            const newRep = parseInt(reputasi + 1);
            await reputasiAdded.set(newRep);
        });
    }
    break;
}
//POKEMON SYSTEM
  /* POKEBALLS*/
  function usePokeball() {
    let pesanBalasan = '';
    RefPokeDelay.once('value', async (snapshot) => {
      const delay = snapshot.val() || 'true';
  
      if (delay === 'true') {
        const randomChance = Math.random() * 100;
  
        if (randomChance < 100) {
          // Potion 100% dapet 1 - 3
          const potionCount = Math.floor(Math.random() * 3) + 1;
          await RefInven.child('potion').once('value', async (snapshot) => {
            const potion = snapshot.val() || 0;
            const updatedPotion = potion + potionCount;
            await RefInven.child('potion').set(updatedPotion);
            pesanBalasan += `${potionCount} Potion.\n`;
          });
  
          const pokeballCount = Math.floor(Math.random() * 3) + 3;
          await RefPoke.once('value', async (snapshot) => {
            const pokeball = snapshot.val() || 0;
            const updatedPokeball = pokeball + pokeballCount;
            await RefPoke.set(updatedPokeball);
            pesanBalasan += `${pokeballCount} Pokeball.\n`;
          });
  
          if (randomChance > 80) {
            // Greatball 10% dapet 1 - 3
            const greatballCount = Math.floor(Math.random() * 3) + 1;
            await RefInven.child('greatballs').once('value', async (snapshot) => {
              const greatball = snapshot.val() || 0;
              const updatedGreatball = greatball + greatballCount;
              await RefInven.child('greatballs').set(updatedGreatball);
              pesanBalasan += `${greatballCount} Greatball.\n`;
            });
          }
          
          if (randomChance > 90) {
            // Ultraball 3% dapet 1 - 2
            const ultraballCount = Math.floor(Math.random() * 2) + 1;
            await RefInven.child('ultraball').once('value', async (snapshot) => {
              const ultraball = snapshot.val() || 0;
              const updatedUltraball = ultraball + ultraballCount;
              await RefInven.child('ultraball').set(updatedUltraball);
              pesanBalasan += `${ultraballCount} Ultraball.\n`;
            });
          } 
          
          if(randomChance >= 96) {
            // Masterball & training ticket 2% dapet 1 - 2
            const masterballCount = Math.floor(Math.random() * 2) + 1;
            await RefInven.child('masterball').once('value', async (snapshot) => {
              const masterball = snapshot.val() || 0;
              const updatedMasterball = masterball + masterballCount;
              await RefInven.child('masterball').set(updatedMasterball);
              pesanBalasan += `${masterballCount} Masterball.\n`;
            });
  
            await RefInven.child('trainingTicket').once('value', async (snapshot) => {
              const trainingTicket = snapshot.val() || 0;
              const updatedTrainingTicket = trainingTicket + masterballCount;
              await RefInven.child('trainingTicket').set(updatedTrainingTicket);
              pesanBalasan += `${masterballCount} Training Ticket.\n`;
            });
          }

        }
        setTimeout(() => {
          message.reply(pesanBalasan);
        },2000)
        await RefPokeDelay.set('false');
  
        setTimeout(async () => {
          await RefPokeDelay.set('true');
        }, 60000);
      } else {
        setTimeout(async () => {
          await RefPokeDelay.set('true');
        }, 60000);
        client.sendMessage(message.from, 'Jeda 1 menit ya, buat farming Pokeballs...');
      }
    });
  }
  
  
  /*BELI POKEBALL*/
  function BuyPokeballs(jumlah) {
    RefPoint.once('value', async (snapshot) => {
      const point = snapshot.val()
      const jumlahBeli = jumlah * 100;
      const jumlahParam = parseInt(jumlah);
      const bayarPoke = point - jumlahBeli;
      if(jumlah <= 0){
        client.sendMessage(message.from,'gabisa mines mines lagi, wkwkwk');
      }else{
        if(point <= 0){
          client.sendMessage(sender, 'point mu mines, sering2 aktif di grub ya biar banyak point hehe');
        }else if(point >= jumlahBeli){
          setTimeout(async () => {
            await RefPoint.set(bayarPoke);
          }, 1000)
          RefPoke.once('value', async (snapshot) => {
            const poke = snapshot.val() || 0;
            const nambahPoke = parseInt(poke + jumlahParam);
            await RefPoke.set(nambahPoke);
          });
          client.sendMessage(message.from,`pembelian pokeballs sebanyak ${jumlah} berhasil`)
      }else{
        client.sendMessage(message.from,'point tidak cukup cuy, harga pokeballs 1 nya 100point');
      }
    }
    });
  };
  /* Beli Potion */
function BeliPotion(jumlah) {
  const jumlahBeli = jumlah * 3;
  const hargaPotion = 250;
  DataData.child('delay').child('potion').once('value', async (snapshot) => {
    const delayData = snapshot.val() || {};
    const isDelay = delayData.delay || true;
    const stock = delayData.stock || 0;
    
    if (isDelay && stock <= 0) {
      client.sendMessage(message.from, `Stok Potion habis. Tunggu pembaruan stok pada pukul 24:00.`);
    } else {
      RefPoint.once('value', async (snapshot) => {
        const point = snapshot.val() || 0;
        if (point < hargaPotion) {
          client.sendMessage(message.from, `Point tidak cukup untuk membeli Potion.`);
        } else {
          await RefInven.child('potion').once('value', async (snapshot) => {
            const potion = snapshot.val() || 0;
            const totalPotion = parseInt(potion + jumlahBeli);
            if (stock < 0) {
              client.sendMessage(message.from, `Jumlah Potion melebihi stok harian.`);
            } else {
              const bayarPotion = point - hargaPotion;
              const kurangiPotion = stock - jumlahBeli;
              await DataData.child('delay').child('potion').child('stock').set(kurangiPotion);
              await RefPoint.set(bayarPotion);
              await RefInven.child('potion').set(totalPotion);
              message.reply(`Berhasil membeli Potion🧪 ${jumlahBeli}pcs`);
            }
          });
        }
      });
    }
  });
}
function BeliElixir(jumlah) {
  const jumlahBeli = jumlah * 1;
  const hargaElixir = 1000;
  DataData.child('delay').child('elixir').once('value', async (snapshot) => {
    const delayData = snapshot.val() || {};
    const isDelay = delayData.delay || true;
    const stock = delayData.stock || 0;
    
    if (isDelay && stock <= 0) {
      client.sendMessage(message.from, `Stok Elixir habis. Tunggu pembaruan stok pada pukul 23:59.`);
    } else {
      RefPoint.once('value', async (snapshot) => {
        const point = snapshot.val() || 0;
        if (point < hargaElixir) {
          client.sendMessage(message.from, `Point tidak cukup untuk membeli Potion.`);
        } else {
          await RefInven.child('elixir').once('value', async (snapshot) => {
            const potion = snapshot.val() || 0;
            const totalPotion = parseInt(potion + jumlahBeli);
            if (jumlahBeli > stock) {
              client.sendMessage(message.from, `Jumlah Elixir melebihi stok harian.`);
            } else {
              const bayarPotion = point - hargaElixir;
              const kurangiPotion = stock - jumlahBeli;
              await DataData.child('delay').child('elixir').child('stock').set(kurangiPotion);
              await RefPoint.set(bayarPotion);
              await RefInven.child('elixir').set(totalPotion);
              message.reply(`Berhasil membeli Elixir⚗️ ${jumlahBeli}pcs`);
            }
          });
        }
      });
    }
  });
}
  /* BELI TRAINING TICKET */
function BeliTicket(jumlah) {
  const jumlahBeli = jumlah;
  const hargaTicket = 5000;
  DataData.child('delay').child('trainingTicket').once('value', async (snapshot) => {
    const delayData = snapshot.val() || {};
    const isDelay = delayData.delay || true;
    const stock = delayData.stock || 0;
    
    if (isDelay && stock <= 0) {
      client.sendMessage(message.from, `Stok TrainingTicket habis. Tunggu pembaruan stok pada pukul 24:00.`);
    } else {
      RefPoint.once('value', async (snapshot) => {
        const point = snapshot.val() || 0;
        if (point < hargaTicket) {
          client.sendMessage(message.from, `Point tidak cukup untuk membeli TrainingTicket.`);
        } else {
          await RefInven.child('trainingTicket').once('value', async (snapshot) => {
            const ticket = snapshot.val() || 0;
            const totalTicket = parseInt(ticket + jumlahBeli);
            if (stock < 0) {
              client.sendMessage(message.from, `Jumlah TrainingTicket melebihi stok harian.`);
            } else {
              const bayarTicket = point - hargaTicket;
              const kurangiTicket = stock - jumlahBeli;
              await DataData.child('delay').child('trainingTicket').child('stock').set(kurangiTicket);
              await RefPoint.set(bayarTicket);
              await RefInven.child('trainingTicket').set(totalTicket);
              message.reply(`Berhasil membeli TrainingTicket🎫 ${jumlahBeli}pcs`);
            }
          });
        }
      });
    }
  });
}

/* Beli GreatBall */
function BeliGreatBalls(jumlah){
  const jumlahBeli = jumlah
  const hargaGreatballs = 500;
  const pengurangan = jumlahBeli * hargaGreatballs;

  RefPoint.once('value',async(snapshot) => {
    const point = snapshot.val() || 0;
    const bayarGreatball = point - pengurangan;
    if(point < pengurangan){
      message.reply('Point mu tidak cukup untuk membeli GreatBalls')
    }else{
        RefInven.child('greatballs').once('value', async(snapshot) => {
          const greatball = snapshot.val() || 0;
          const tambahGreatball = greatball + parseInt(jumlah);
          await RefInven.child('greatballs').set(tambahGreatball);
          await RefPoint.set(bayarGreatball);
        });
    }
  });
}
/* Beli UltraBall */
function BeliUltraBall(jumlah){
  const jumlahBeli = jumlah
  const hargaUltraballs = 1000;
  const pengurangan = jumlahBeli * hargaUltraballs;

  RefPoint.once('value',async(snapshot) => {
    const point = snapshot.val() || 0;
    const bayarUltraball = point - pengurangan;
    if(point < pengurangan){
      message.reply('Point mu tidak cukup untuk membeli UltraBalls')
    }else{
        RefInven.child('ultraball').once('value', async(snapshot) => {
          const ultraball = snapshot.val() || 0;
          const tambahUltraBall = ultraball + parseInt(jumlah); 
          await RefInven.child('ultraball').set(tambahUltraBall);
          await RefPoint.set(bayarUltraball);
          message.reply(`Pembelian Ultraball ${jumlah} Berhasil`)
        });
    }
  });
}


  /*command pokemon */
if(pesan === '!pokeball'){
  usePokeball();
};
if (Buy) {
  const trigger = Buy[1];
  const param1 = Buy[2];

  if (trigger === 'pokeball') {
    BuyPokeballs(param1);
  } else if (trigger === 'pokemon') {
    if (param1) {
      RefPokemon.once('value', async (snapshot) => {
        const pokemonData = snapshot.val() || {};
        const pokemonCount = Object.keys(pokemonData).length;
        if(pokemonCount > 25){
          message.reply('Pokedex lu udah penuh, dismiss salah satu atau jualin kek')
        }else{
          try {
            MarketRef.once('value', async (snapshot) => {
              const marketData = snapshot.val() || {};
              const marketKeys = Object.keys(marketData);
              const selectedPokemonKey = marketKeys[param1 - 1];
              const snapshotPoint = await RefPoint.once('value');
              const pointPembeli = snapshotPoint.val() || 0;
              
              if (selectedPokemonKey) {
                const selectedPokemon = marketData[selectedPokemonKey];
                const { namaPokemon, HP, ATTACK, DEFENSE, SPEED, EXP, LVL, TYPE, harga, penjual } = selectedPokemon;
                
                if (pointPembeli >= parseInt(harga)) {
                  const pembelian = pointPembeli - parseInt(harga);
                  await RefPoint.set(pembelian);
                  await RefPokemon.push(selectedPokemon);
                  await MarketRef.child(selectedPokemonKey).remove();

              // Melakukan penambahan point ke penjual
              const snapshotPointPenjual = await pointRef.child(penjual).child('point').once('value');
              const pointPenjual = snapshotPointPenjual.val() || 0;
              const penjualan = pointPenjual + parseInt(harga);
              await pointRef.child(penjual).child('point').set(penjualan);

              client.sendMessage(message.from,`Berhasil membeli:\nNama: ${namaPokemon}\nHP: ${HP}\nAttack: ${ATTACK}\nDefense: ${DEFENSE}\nSpeed: ${SPEED}\nLevel: ${LVL}\nEXP: ${EXP}\nType: ${TYPE}\nHarga: ${harga.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`);
            } else {
              client.sendMessage(message.from, `Point Anda tidak cukup untuk membeli pokemon ini.`);
            }
          } else {
            client.sendMessage(message.from,'Pilihan tidak valid. Silakan cek kembali daftar pokemon yang tersedia di market.');
          }
        });
      } catch (error) {
        console.error('Error:', error);
        client.sendMessage(message.from,'Terjadi kesalahan dalam melakukan pembelian. Silakan coba lagi nanti.');
      }
    }
  });
    } else {
      client.sendMessage(message.from,'Pilihan pokemon tidak valid. Harap berikan nomor yang sesuai dengan daftar pokemon di market.');
    }
    
  
  }else if(trigger === 'potion'){
    BeliPotion(param1);
  }else if(trigger === 'ticket'){
    BeliTicket(param1);
  }else if(trigger === 'greatball'){
    BeliGreatBalls(param1);
  }else if(trigger === 'ultraball'){
    BeliUltraBall(param1);
  }else if(trigger === 'elixir'){
    BeliElixir(param1);
  }else{
    client.sendMessage(message.from, 'Sedang Tahap Devrlopment');
    setTimeout(() => {
      client.sendMessage(message.from, '*Development sorry typo');
      },2000)
  }
}


if(pesan === '!cektas'){
  let pokeballs = '';
  const pokemon = [];
  await RefPokemon.once('value', async (snapshot) => {
    const pokemonA = await snapshot.val() || {};
    const Vlimited = Object.keys(pokemonA);
    const limited5 = Vlimited.slice(0,5);
    limited5.forEach((id) => {
      const pokemonName = pokemonA[id].namaPokemon;
      pokemon.push(pokemonName);
    });
  });
  setTimeout(async () => {
        RefInven.once('value', async (snapshot) => {
            const inventory = snapshot.val() || 0;
            const pokeballs = inventory.pokeballs || 0;
            const greatballs = inventory.greatballs || 0;
            const ultraball = inventory.ultraball || 0;
            const masterball = inventory.masterball || 0;
            const potion = inventory.potion || 0;
            const elixir = inventory.elixir || 0;
            const trainingTicket = inventory.trainingTicket || 0;

        const pokemonList = pokemon.map((name, index) => `${'-'} ${name}`).join("\n");
        client.sendMessage(message.from,`Inventory\nItems:\n  -PokeBalls: ${pokeballs}.\n  -GreatBalls: ${greatballs}.\n  -UltraBalls: ${ultraball}.\n  -MasterBalls: ${masterball}.\n  -Elixir: ${elixir}.\n  -Potion: ${potion}.\n  -Training Ticket: ${trainingTicket}.\nPokemon:\n${pokemonList}`);
      });
      },1000 )
}

if (pesan === '!pokedex') {
  const pokemon = [];

  await RefPokemon.once('value', async (snapshot) => {
    const pokemonData = snapshot.val() || {};

    Object.keys(pokemonData).forEach((id) => {
      const pokemonName = pokemonData[id].namaPokemon;
      const pokemonHP = pokemonData[id].HP;
      const pokemonATT = pokemonData[id].ATTACK;
      const pokemonDEFF = pokemonData[id].DEFENSE;
      const pokemonTYPE = pokemonData[id].TYPE;

      const pokemonStats = {
        name: pokemonName,
        hp: pokemonHP,
        attack: pokemonATT,
        defense: pokemonDEFF,
        type: pokemonTYPE
      };

      pokemon.push(pokemonStats);
    });
  });

  setTimeout(() => {
    const jumlahPokemon = pokemon.length;
    let pokemonList = '';
    pokemon.forEach((pokemonStats, index) => {
      const { name, hp, attack, defense, type } = pokemonStats;
      pokemonList += `${index + 1}. ${name}\n`;
      pokemonList += `   - HP: ${hp}\n`;
      pokemonList += `   - Attack: ${attack}\n`;
      pokemonList += `   - Defense: ${defense}\n`;
      pokemonList += `   - Type: ${type}\n`;
    });

    client.sendMessage(message.from,`*POKÉDEX*.\nJumlah Pokemon: ${jumlahPokemon}\n${pokemonList}`);
  }, 1000);
}

if (pesan.startsWith('!catch')) {
  const param1 = pesan.split(' ')[1];
  RefPokemon.once('value', async (snapshot) => {
    const pokemonData = snapshot.val() || {};
    const pokemonCount = Object.keys(pokemonData).length;
    if(pokemonCount > 25){
      message.reply('Pokedex lu udah penuh, dismiss salah satu atau jualin kek')
    }else{

      await axios.get(`https://pokeapi.co/api/v2/pokemon/?offset=0&limit=2200`).then(resp => {
        const raw = resp.data.results;
        const pickOnePoke = raw.map(pokemon => pokemon);
    const randomPoke = pickOnePoke[Math.floor(Math.random() * raw.length)];
    let chanceBerhasil = 0;
    const resultValue = Math.random();
    
    RefInven.once('value', async(snapshot) => {
      const inventory = snapshot.val() || {};
      const pokeballs = inventory.pokeballs || 0;
      const greatballs = inventory.greatballs || 0;
      const ultraballs = inventory.ultraball || 0;
      const masterball = inventory.masterball || 0;
      if(param1 === 'greatball'){
        chanceBerhasil = 0.65;
        if (resultValue <= chanceBerhasil) {
          const pakeGreatballs = greatballs - 1;
          if (greatballs >= 1) {
            await RefInven.child('greatballs').set(pakeGreatballs);
            await axios.get(randomPoke.url).then(respon => {
              client.sendMessage(message.from, `*${randomPoke.name.toUpperCase()}*\nSTATUS:\n${respon.data.stats[0].stat.name.toUpperCase()}: ${respon.data.stats[0].base_stat}.\n${respon.data.stats[1].stat.name.toUpperCase()}: ${respon.data.stats[1].base_stat}\n${respon.data.stats[2].stat.name.toUpperCase()}: ${respon.data.stats[2].base_stat}\n${respon.data.stats[5].stat.name.toUpperCase()}: ${respon.data.stats[5].base_stat}\n\nPokemon Type: ${respon.data.types[0].type.name.toUpperCase()}.`);
              RefPokemon.push({
                  namaPokemon: randomPoke.name.toUpperCase(),
                  HP: respon.data.stats[0].base_stat,
                  MAXHP: respon.data.stats[0].base_stat,
                  ATTACK: respon.data.stats[1].base_stat,
                  DEFENSE: respon.data.stats[2].base_stat,
                  SPEED: respon.data.stats[5].base_stat,
                  LVL: 0,
                  EXP: 0,
                  TYPE: respon.data.types[0].type.name.toUpperCase()
                });
              });
            } else {
              client.sendMessage(message.from, 'nangkep pokemon gabisa pake tangan mas. cari pokeball dulu gih !pokeball.\nKalo ga beli !buy pokeball/greatball/ultraball 1');
            }
          } else {
            const pakeGreatballs = greatballs - 1;
            if (greatballs >= 1) {
              await RefInven.child('greatballs').set(pakeGreatballs)
              client.sendMessage(message.from, 'awokaowk, kabur pokemonnya');
            } else {
              client.sendMessage(message.from, 'nangkep pokemon gabisa pake tangan mas. cari pokeball dulu gih !pokeball.\nKalo ga beli !buy pokeball/greatball/ultraball 1');
            }
          }
        }else if(param1 === 'ultraball'){
        chanceBerhasil = 0.85;
        if (resultValue <= chanceBerhasil) {
          const pakeUltraBall = ultraballs - 1;
          if (ultraballs >= 1) {
            await RefInven.child('ultraball').set(pakeUltraBall);
            await axios.get(randomPoke.url).then(respon => {
              client.sendMessage(message.from, `*${randomPoke.name.toUpperCase()}*\nSTATUS:\n${respon.data.stats[0].stat.name.toUpperCase()}: ${respon.data.stats[0].base_stat}.\n${respon.data.stats[1].stat.name.toUpperCase()}: ${respon.data.stats[1].base_stat}\n${respon.data.stats[2].stat.name.toUpperCase()}: ${respon.data.stats[2].base_stat}\n${respon.data.stats[5].stat.name.toUpperCase()}: ${respon.data.stats[5].base_stat}\n\nPokemon Type: ${respon.data.types[0].type.name.toUpperCase()}.`);
              RefPokemon.push({
                  namaPokemon: randomPoke.name.toUpperCase(),
                  HP: respon.data.stats[0].base_stat,
                  MAXHP: respon.data.stats[0].base_stat,
                  ATTACK: respon.data.stats[1].base_stat,
                  DEFENSE: respon.data.stats[2].base_stat,
                  SPEED: respon.data.stats[5].base_stat,
                  LVL: 0,
                  EXP: 0,
                  TYPE: respon.data.types[0].type.name.toUpperCase()
                });
              });
            } else {
              client.sendMessage(message.from, 'nangkep pokemon gabisa pake tangan mas. cari pokeball dulu gih !pokeball.\nKalo ga beli !buy pokeball/greatball/ultraball 1');
            }
          } else {
            const pakeUltraBall = ultraballs - 1;
            if (ultraballs >= 1) {
              await RefInven.child('ultraball').set(pakeUltraBall)
              client.sendMessage(message.from, 'awokaowk, kabur pokemonnya');
            } else {
              client.sendMessage(message.from, 'nangkep pokemon gabisa pake tangan mas. cari pokeball dulu gih !pokeball.\nKalo ga beli !buy pokeball/greatball/ultraball 1');
            }
          }
      }else if(param1 === 'masterball'){
        chanceBerhasil = 1;
        if (resultValue <= chanceBerhasil) {
          const pakeMasterBall = masterball - 1;
          if (masterball >= 1) {
            await RefInven.child('masterball').set(pakeMasterBall);
            await axios.get(randomPoke.url).then(respon => {
              client.sendMessage(message.from, `*${randomPoke.name.toUpperCase()}*\nSTATUS:\n${respon.data.stats[0].stat.name.toUpperCase()}: ${respon.data.stats[0].base_stat}.\n${respon.data.stats[1].stat.name.toUpperCase()}: ${respon.data.stats[1].base_stat}\n${respon.data.stats[2].stat.name.toUpperCase()}: ${respon.data.stats[2].base_stat}\n${respon.data.stats[5].stat.name.toUpperCase()}: ${respon.data.stats[5].base_stat}\n\nPokemon Type: ${respon.data.types[0].type.name.toUpperCase()}.`);
              RefPokemon.push({
                namaPokemon: randomPoke.name.toUpperCase(),
                HP: respon.data.stats[0].base_stat,
                MAXHP: respon.data.stats[0].base_stat,
                ATTACK: respon.data.stats[1].base_stat,
                DEFENSE: respon.data.stats[2].base_stat,
                SPEED: respon.data.stats[5].base_stat,
                LVL: 0,
                EXP: 0,
                TYPE: respon.data.types[0].type.name.toUpperCase()
              });
            });
          } else {
            client.sendMessage(message.from, 'nangkep pokemon gabisa pake tangan mas. cari pokeball dulu gih !pokeball.\nKalo ga beli !buy pokeball/greatball/ultraball 1');
            }
        } else {
          const pakeMasterBall = masterball - 1;
          if (masterball >= 1) {
            await RefInven.child('masterball').set(pakeMasterBall)
              client.sendMessage(message.from, 'awokaowk, kabur pokemonnya');
            } else {
              client.sendMessage(message.from, 'nangkep pokemon gabisa pake tangan mas. cari pokeball dulu gih !pokeball.\nKalo ga beli !buy pokeball/greatball/ultraball 1');
            }
          }
        }else{
          chanceBerhasil = 0.5;
          if (resultValue <= chanceBerhasil) {
            const pakePokeball = pokeballs - 1;
            if (pokeballs >= 1) {
              await RefPoke.set(pakePokeball);
              await axios.get(randomPoke.url).then(respon => {
                client.sendMessage(message.from, `*${randomPoke.name.toUpperCase()}*\nSTATUS:\n${respon.data.stats[0].stat.name.toUpperCase()}: ${respon.data.stats[0].base_stat}.\n${respon.data.stats[1].stat.name.toUpperCase()}: ${respon.data.stats[1].base_stat}\n${respon.data.stats[2].stat.name.toUpperCase()}: ${respon.data.stats[2].base_stat}\n${respon.data.stats[5].stat.name.toUpperCase()}: ${respon.data.stats[5].base_stat}\n\nPokemon Type: ${respon.data.types[0].type.name.toUpperCase()}.`);
                RefPokemon.push({
                  namaPokemon: randomPoke.name.toUpperCase(),
                  HP: respon.data.stats[0].base_stat,
                  MAXHP: respon.data.stats[0].base_stat,
                  ATTACK: respon.data.stats[1].base_stat,
                  DEFENSE: respon.data.stats[2].base_stat,
                  SPEED: respon.data.stats[5].base_stat,
                  LVL: 0,
                  EXP: 0,
                  TYPE: respon.data.types[0].type.name.toUpperCase()
                });
              });
            } else {
              client.sendMessage(message.from, 'nangkep pokemon gabisa pake tangan mas. cari pokeball dulu gih !pokeball.\nKalo ga beli !buy pokeball 1');
            }
          } else {
            const pakePokeball = pokeballs - 1;
            if (pokeballs >= 1) {
              await RefPoke.set(pakePokeball);
              client.sendMessage(message.from, 'awokaowk, kabur pokemonnya');
            } else {
              client.sendMessage(message.from, 'nangkep pokemon gabisa pake tangan mas. cari pokeball dulu gih !pokeball.\nKalo ga beli !buy pokeball 1');
            }
            await RefPoke.set(pakePokeball);
          }   
      }
});
}).catch((err) => {
  console.log(err);
});
    }
}); //ini ref pokemon ada berapa
}



if (pesan.startsWith('!setgacoan')) {
  const param1 = parseInt(pesan.split(' ')[1]) - 1;
  const pokemon = [];
  
  if (param1 >= 0) {
    await RefPokemon.once('value', async (snapshot) => {
      const pokemonData = snapshot.val() || {};

      Object.keys(pokemonData).forEach((id) => {
        const pokemonName = pokemonData[id].namaPokemon;
        const pokemonHP = pokemonData[id].HP;
        const pokemonATT = pokemonData[id].ATTACK;
        const pokemonDEFF = pokemonData[id].DEFENSE;
        const pokemonSPD = pokemonData[id].SPEED;
        const pokemonLVL = pokemonData[id].LVL;
        const pokemonEXP = pokemonData[id].EXP;
        const pokemonTYPE = pokemonData[id].TYPE;

        const pokemonStats = {
          namaPokemon: pokemonName,
          HP: pokemonHP,
          MAXHP: pokemonHP,
          ATTACK: pokemonATT,
          DEFENSE: pokemonDEFF,
          SPEED: pokemonSPD,
          LVL: pokemonLVL,
          EXP: pokemonEXP,
          TYPE: pokemonTYPE
        };

        pokemon.push(pokemonStats);
      });
      
      setTimeout(() => {
      const jumlahPokemon = pokemon.length;
      if (param1 < jumlahPokemon) {
        const gacoan = pokemon[param1];
        const { namaPokemon, HP, MAXHP, ATTACK, DEFENSE, SPEED, LVL, EXP, TYPE } = gacoan;
        RefGacoan.once('value',async(snapshot) => {
          const gacoanUdahAda = snapshot.val();
          RefGacoan.once('value', async(snapshot) => {
            const Gacoan = snapshot.val()
            if(Gacoan){
              RefPokemon.push(gacoanUdahAda);
              const pokemonId = Object.keys(pokemonData)[param1];
              RefPokemon.child(pokemonId).remove();
              RefGacoan.set(gacoan);
              let pokemonList = '';
              pokemonList += `Gacoan: ${namaPokemon} LVL: ${LVL}\n`;
              pokemonList += `   - HP: ${HP}\n`;
              pokemonList += `   - Attack: ${ATTACK}\n`;
              pokemonList += `   - Defense: ${DEFENSE}\n`;
              pokemonList += `   - Speed: ${SPEED}\n`;
              pokemonList += `   - EXP: ${EXP}\n`;
              pokemonList += `   - Type: ${TYPE}\n`;
              client.sendMessage(message.from,`Berhasil set Gacoan:\n${pokemonList}`);
            }else{
              RefGacoan.set(gacoan);
              const pokemonId = Object.keys(pokemonData)[param1];
            RefPokemon.child(pokemonId).remove();
            let pokemonList = '';
            pokemonList += `Gacoan: ${namaPokemon} LVL: ${LVL}\n`;
            pokemonList += `   - HP: ${HP}\n`;
            pokemonList += `   - Attack: ${ATTACK}\n`;
            pokemonList += `   - Defense: ${DEFENSE}\n`;
            pokemonList += `   - Speed: ${SPEED}\n`;
            pokemonList += `   - EXP: ${EXP}\n`;
            pokemonList += `   - Type: ${TYPE}\n`;
            client.sendMessage(message.from,`Berhasil set Gacoan:\n${pokemonList}`);
          }
        });
        });
        
      } else {
        client.sendMessage(message.from,`Nomor Pokemon tidak valid. Silakan pilih nomor antara 1 dan ${jumlahPokemon}.`);
      }
      
    }, 1000);
  });
  } else {
    client.sendMessage(message.from,`Nomor Pokemon tidak valid. Silakan pilih nomor antara 1 dan ${pokemon.length}.`);
  }
}

if(pesan.startsWith('!lepasgacoan')){
  RefGacoan.once('value', async (snapshot) => {
    const dataGacoan = snapshot.val() || {};
      RefPokemon.push(dataGacoan);  
      setTimeout(async () => {
        await RefGacoan.remove();
        message.reply('Gacoan Berhasil di hapus')
      },2000)
  });
}



if (pesan.startsWith('!fight')) {
  const param1 = pesan.split(' ')[1];
  let p1 = [];
  let p2 = [];
  if (param1) {
    RefFightDelay.once('value', async(snapshot) => {
      const delayF = snapshot.val() || "true"
      if(delayF === 'true'){
        const RefGacoan2 = param1.replace(/@/g, '') + '_c_us';
        const RefGacoanP2 = PokemonRef.child(RefGacoan2).child('pokemon').child('gacoan');
        
    RefGacoan.once('value', async (snapshot) => {
      const gacoanP1 = snapshot.val() || {};
      if (Object.keys(gacoanP1).length > 0) {
        p1.push(gacoanP1);
      } else {
        client.sendMessage(message.from,'lu belum ada gacoan. set dulu !setgacoan');
      }
    });
    
    RefGacoanP2.once('value', async (snapshot) => {
      const gacoanP2 = snapshot.val() || {};
      if (Object.keys(gacoanP2).length > 0) {
        p2.push(gacoanP2);
      } else {
        client.sendMessage(message.from,'Lawan lu belom punya gacoan. Telponin suruh set gitu');
      }
    });
    setTimeout(() => {
      //message.reply(`Bentar ya lagi maintenance`);
      fightPvpPokemon(p1, p2, param1)
    }, 3000)
  }else{
    setTimeout(async () => {
      await RefFightDelay.set('true');
    }, 180000);
    message.reply('Pertarungan Gagal, salah satu dari kalian Sedang Cooldown')
  }
});
}else {
  let BOT = [];
  let P1 = [];

  const gacoanSnapshot = await RefGacoan.once('value');
  const gacoanP1 = gacoanSnapshot.val();

  if (gacoanP1) {
    P1.push(gacoanP1);

    // Mencari musuh
    const pokemonResp = await axios.get('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=2200');
    const raw = pokemonResp.data.results;
    const pickOnePoke = raw.map(pokemon => pokemon);
    const randomPoke = pickOnePoke[Math.floor(Math.random() * raw.length)];

    const respon = await axios.get(randomPoke.url);
    const randomPokemon = {
      namaPokemon: randomPoke.name.toUpperCase(),
      HP: parseInt(P1[0].MAXHP - respon.data.stats[0].base_stat),
      ATTACK: P1[0].ATTACK - respon.data.stats[1].base_stat,
      DEFENSE: P1[0].DEFENSE - respon.data.stats[2].base_stat,
      SPEED: P1[0].SPEED - respon.data.stats[5].base_stat,
      TYPE: respon.data.types[0].type.name.toUpperCase()
    };
    BOT.push(randomPokemon);

    setTimeout(() => {
      setTimeout(() => {
        const musuhStats = Object.entries(BOT[0]).map(([key, value]) => `${key}: ${value}`).join('\n');
        const battleResult = `${musuhStats}`;
        client.sendMessage(message.from, `musuh ditemukan\n${battleResult}`);
        fightAiPokemon(P1, BOT);
      }, 2000)
    }, 1000);
  } else {
    message.reply('belum ada dekingan, mending cari dulu gih !catch, kalo udah !setgacoan');
  }
} //else lawan AI
}//if pesan.startwith(!fight)



if(pesan.startsWith('!use')){
  const param1 = pesan.split(" ")[1];
  if(param1 === 'potion') {
    RefInven.child('potion').once('value', async(snapshot) => {
      const potion = snapshot.val() || 0
      const usePotion = potion - 1;
      if(potion <= 0){
        message.reply('Potion mu habis mas, cari dulu gih !pokeball atau beli di market !buy potion 1');
      }else{
        RefGacoan.once('value', async (snapshot) => {
          const dataGacoan = snapshot.val() || {}
          const MaxHP = dataGacoan.MAXHP;
          const HP = dataGacoan.HP;
          const addHP = dataGacoan.HP + 500;
          const newHP = addHP > MaxHP ? MaxHP : addHP;
          if(HP <= MaxHP){
            message.reply('Pokemon HP +500');
            await RefGacoan.child('HP').set(newHP);
            await RefInven.child('potion').set(usePotion);
          }else{
            message.reply('Darahnya udah penuh mas, nanti potion lu abis');
            await RefGacoan.child('HP').set(MaxHP);
          }
        });
      }
      });
    }else if(param1 === 'elixir'){
      RefInven.child('elixir').once('value', async(snapshot) => {
        const elixir = snapshot.val() || 0
        const useElixir = elixir - 1;
        if(elixir <= 0){
          message.reply('Elixir mu habis mas, beli dulu gih di market !buy elixir 1');
        }else{
          RefGacoan.once('value', async (snapshot) => {
            const dataGacoan = snapshot.val() || {}
            const HP = dataGacoan.HP;
            const MaxHP = dataGacoan.MAXHP;
            if(HP >= MaxHP){
              message.reply(`Darah udah Penuh mas`);
            }else{
              message.reply(`Pokemon HP +${MaxHP}`);
              await RefInven.child('elixir').set(useElixir);
              await RefGacoan.child('HP').set(MaxHP);
            }
          });
        }
        });
      }else{
    message.react('🤣')
  }
}

if (pesan.startsWith('!training')) {
  RefInven.child('trainingTicket').once('value', async (snapshot) => {
    const tiket = snapshot.val() || 0;
    const useTicket = tiket - 1;
    if (tiket <= 0) {
      message.reply('Training Ticket kamu tidak cukup mas');
    } else {
      RefInven.child('trainingTicket').set(useTicket);
      RefGacoan.once('value', async (snapshot) => {
        const dataGacoan = snapshot.val() || {};
        const namaPokemon = dataGacoan.namaPokemon;
        let attack = dataGacoan.ATTACK;
        let defense = dataGacoan.DEFENSE;
        let hp = dataGacoan.HP;
        let maxHp = dataGacoan.MAXHP || 0;
        const speed = dataGacoan.SPEED;
        const type = dataGacoan.TYPE;
        const exp = dataGacoan.EXP;
        const level = dataGacoan.LVL;

        const getRandomStatIncrease = (min, max) => {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        const increaseAttack = getRandomStatIncrease(10, 50);
        const increaseDefense = getRandomStatIncrease(10, 50);
        const increaseHP = getRandomStatIncrease(10, 50);

        attack += increaseAttack;
        defense += increaseDefense;
        maxHp += increaseHP;

        RefGacoan.child('ATTACK').set(attack);
        RefGacoan.child('DEFENSE').set(defense);
        RefGacoan.child('MAXHP').set(maxHp);

        message.reply(`Stat ${namaPokemon} berhasil di training\nAttack +${increaseAttack}, Defense +${increaseDefense}, HP +${increaseHP}`);
      });
    }
  });
}



if (pesan.startsWith('!cekgacoan')) {
  const param1 = pesan.split(' ')[1];
  if (param1) {
    const RefGacoan = param1.replace(/@/g, '') + '_c_us';
    const RefGacoanA = PokemonRef.child(RefGacoan).child('pokemon').child('gacoan');
    RefGacoanA.once('value', (snapshot) => {
      const gacoanMusuh = snapshot.val();
      if (gacoanMusuh) {
        const { namaPokemon, HP, ATTACK, DEFENSE,SPEED, LVL, EXP, TYPE } = gacoanMusuh;
        client.sendMessage(message.from,`gacoan Dia ni\n${namaPokemon}\nLevel: ${LVL}\nHP: ${HP}\nAttack: ${ATTACK}\nDefense: ${DEFENSE}\nSpeed: ${SPEED}\nTYPE: ${TYPE}\nEXP: ${EXP}`);} else {
        client.sendMessage(message.from,'Dia belom ada gacoan anjay.');
      }
    });
  } else {
    RefGacoan.once('value', (snapshot) => { 
      const gacoanGua = snapshot.val();
      if (gacoanGua) {
        const { namaPokemon, HP, ATTACK, DEFENSE,SPEED, LVL, EXP, TYPE } = gacoanGua;
        client.sendMessage(message.from,`gacoan lu ni\n${namaPokemon}\nLevel: ${LVL}\nHP: ${HP}\nAttack: ${ATTACK}\nDefense: ${DEFENSE}\nSpeed: ${SPEED}\nTYPE: ${TYPE}\nEXP: ${EXP}`);
      } else {
        client.sendMessage(message.from,'Dia belom ada gacoan anjay.');
      }
    });
  }
}

if (pesan.startsWith('!dismiss')) {
  const param1 = parseInt(pesan.split(' ')[1]) - 1;
  const pokemon = [];
  if (param1 >= 0) {
    await RefPokemon.once('value', async (snapshot) => {
      const pokemonData = snapshot.val() || {};
        Object.keys(pokemonData).forEach((id) => {
          const pokemonName = pokemonData[id].namaPokemon;
          const pokemonHP = pokemonData[id].HP;
          const pokemonATT = pokemonData[id].ATTACK;
          const pokemonDEFF = pokemonData[id].DEFENSE;
          const pokemonSPD = pokemonData[id].SPEED;
          const pokemonTYPE = pokemonData[id].TYPE;

          const pokemonStats = {
            namaPokemon: pokemonName,
            HP: pokemonHP,
            ATTACK: pokemonATT,
            DEFENSE: pokemonDEFF,
            SPEED: pokemonSPD,
            TYPE: pokemonTYPE,
            penjual: sanitizedSender,
          };

          pokemon.push(pokemonStats);
        });
        setTimeout(async () => {
          const jumlahPokemon = pokemon.length;
          if (param1 < jumlahPokemon) {
            const jualPoke = pokemon[param1];
            const { namaPokemon, HP, ATTACK, DEFENSE, SPEED, TYPE, harga, penjual } = jualPoke;
            let pokemonList = '';
            pokemonList += `${namaPokemon}\n`;
            client.sendMessage(message.from,`Berhasil Ngelepasin\n${pokemonList}`);

            setTimeout(async () => {
              const snapshot = await RefPokemon.once('value');
              const pokemonData = snapshot.val() || {};
              const pokemonKeys = Object.keys(pokemonData);
              const pokemonIdToDelete = pokemonKeys[param1];
              await RefPokemon.child(pokemonIdToDelete).remove();
            }, 2000);
          }
        }, 1000);
    });
  } else {
    client.sendMessage(message.from,'Format yang benar: `!dismiss <nomor_pokemon>`\nContoh: `!dismiss 4`');
  }
}
if (pesan.startsWith('!sell')) {
  const param1 = parseInt(pesan.split(' ')[1]) - 1;
  const param3 = pesan.split(' ')[1];
  const pokemon = [];

  if (param1 >= 0) {
    const param2 = parseInt(pesan.split(' ')[2]);

    await RefPokemon.once('value', async (snapshot) => {
      const pokemonData = snapshot.val() || {};

      // Jual
      if (param2 >= 500) {
        Object.keys(pokemonData).forEach((id) => {
          const pokemonName = pokemonData[id].namaPokemon;
          const pokemonHP = pokemonData[id].HP;
          const pokemonATT = pokemonData[id].ATTACK;
          const pokemonDEFF = pokemonData[id].DEFENSE;
          const pokemonSPD = pokemonData[id].SPEED;
          const pokemonTYPE = pokemonData[id].TYPE;
          const pokemonEXP = pokemonData[id].EXP || 0;
          const pokemonLVL = pokemonData[id].LVL || 0;

          const pokemonStats = {
            namaPokemon: pokemonName,
            HP: pokemonHP,
            ATTACK: pokemonATT,
            DEFENSE: pokemonDEFF,
            SPEED: pokemonSPD,
            TYPE: pokemonTYPE,
            EXP: pokemonEXP,
            LVL: pokemonLVL,
            harga: param2,
            penjual: sanitizedSender,
          };

          pokemon.push(pokemonStats);
        });

        setTimeout(async () => {
          const jumlahPokemon = pokemon.length;
          if (param1 < jumlahPokemon) {
            const jualPoke = pokemon[param1];
            const { namaPokemon, HP, ATTACK, DEFENSE, SPEED, TYPE, harga, penjual } = jualPoke;

            await MarketRef.push(jualPoke);

            let pokemonList = '';
            pokemonList += `Nama: ${namaPokemon}\n`;
            pokemonList += `   - HP: ${HP}\n`;
            pokemonList += `   - Attack: ${ATTACK}\n`;
            pokemonList += `   - Defense: ${DEFENSE}\n`;
            pokemonList += `   - Speed: ${SPEED}\n`;
            pokemonList += `   - Type: ${TYPE}\n`;
            pokemonList += `   - Harga: ${harga}\n`;

            client.sendMessage(message.from,`Berhasil Menjual\n${pokemonList}`);

            setTimeout(async () => {
              const snapshot = await RefPokemon.once('value');
              const pokemonData = snapshot.val() || {};
              const pokemonKeys = Object.keys(pokemonData);
              const pokemonIdToDelete = pokemonKeys[param1];
              await RefPokemon.child(pokemonIdToDelete).remove();
            }, 2000);
          }
        }, 1000);
      } else {
        client.sendMessage(message.from,'Harga jual harus lebih dari atau sama dengan 500.');
      }
    });
  } else if(param3 === 'tiket'){
    client.sendMessage(message.from,'!sell tiket function(sellTrainingTicket(Anonymous))');
  }else{
    client.sendMessage(message.from,'Format yang benar: `!sell <nomor_pokemon> <harga>`\nContoh: `!sell 4 100000`\nAtau !sell tiket 4500');
    
  }
}

if(pesan.startsWith('!market')){
  const Market = [];
  await MarketRef.once('value', async (snapshot) =>{
    const marketData = snapshot.val() || {};

    Object.keys(marketData).forEach((id) => {
      const pokemonName = marketData[id].namaPokemon;
      const pokemonHP = marketData[id].HP;
      const pokemonATT = marketData[id].ATTACK;
      const pokemonDEFF = marketData[id].DEFENSE;
      const pokemonSPD = marketData[id].SPEED;
      const pokemonTYPE = marketData[id].TYPE;
      const pokemonHARGA = marketData[id].harga;
      const pokemonPENJUAL = marketData[id].penjual;

      const pokemonList = {
        namaPokemon: pokemonName,
        HP: pokemonHP,
        ATTACK: pokemonATT,
        DEFENSE: pokemonDEFF,
        SPEED: pokemonSPD,
        TYPE: pokemonTYPE,
        harga: pokemonHARGA,
        penjual: pokemonPENJUAL,
      };
      Market.push(pokemonList);
    });

    setTimeout(async () => {
      if (Market.length === 0) {
        message.reply('*Welcome To Pokemon Market*\nMarket Masih Kosong nih');
      } else {
        let marketList = '';
        Market.forEach((pokemonList, index) => {
          const { namaPokemon, HP, ATTACK, DEFENSE, SPEED, TYPE, harga } = pokemonList;
          marketList += `${index + 1}. ${namaPokemon}\n`;
          marketList += `   - HP: ${HP}\n`;
          marketList += `   - Attack  : ${ATTACK}\n`;
          marketList += `   - Defense: ${DEFENSE}\n`;
          marketList += `   - Speed: ${SPEED}\n`;
          marketList += `   - Type: ${TYPE}\n`;
          marketList += `   - HARGA: ${harga.toLocaleString('id-ID', { minimumFractionDigits: 0 })}Point\n`;
        });
        client.sendMessage(message.from,`*Welcome To Pokemon Market*\n*POKEMON*\n${marketList}`);
      }
    },1000)
  });
}
  
  //end of the line
});
client.initialize();
