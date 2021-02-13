const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs')
const randtxt = require('./modules/randtxt')
let db
let opinions = []
let subject
let discussion = false
let vote = false
let voteresult = {}
client.on('ready', () => {
  console.log(`Ready!`)
  client.user.setPresence({
    status: 'online',
    activity: {
        name: `!도움`,
        type: "PLAYING"
    }})
});

client.on('message', (msg) => {
 if(msg.content == '!도움') {
  const help = new Discord.MessageEmbed()
	.setColor('#0099ff')
  .setTitle('!도움')
  .setThumbnail(msg.author.avatarURL())
	.setDescription('봇의 명령어를 알려줍니다.')
	.addFields(
		{ name: '\u200B', value: '\u200B' },
		{ name: '접두사', value: '!'},
    { name: '토의시작/[주제]', value: '토의를 시작합니다.'},
    { name: '의견추가/[의견]', value: '의견을 추가합니다.'},
    { name: '리스트', value: '의견을 모두 보여줍니다.'},
    { name: '투표시작', value: '투표를 시작합니다.'},
    { name: '투표하기 [투표할 대상]', value: '[투표할 대상]에게 투표를 합니다.'},
    { name: '투표리스트', value: '의견이 몇표인지 보여줍니다.'},
    { name: '토의저장', value: '현재 하고있는 토의를 저장합니다.'},
    { name: '불러오기 [아이디]', value: '[아이디]에 대한 토의내용을 불러옵니다.'},
    { name: '종료', value: '투표를 종료합니다.'},
	)

	.setTimestamp()
	.setFooter('!도움', msg.author.avatarURL());

msg.channel.send(help);
 }
  
  
  else if (msg.content.startsWith('!토의시작')) { 
    if(discussion == true) return msg.reply('토의가 이미 시작되었습니다')
    let args = msg.content.split('/') //1 = 주제
    subject = args[1]
    msg.reply(`토의가 시작되었습니다. (주제:${subject})`)
    discussion = true
  }
  
  
  else if(msg.content.startsWith('!의견추가')) {
    if(discussion == false) return msg.reply('토의가 아직 시작되지 않았습니다.')
    let args = msg.content.split('/')
    opinions[opinions.length] = args[1]
    msg.reply('의견 추가됨.')
    
  }
  else if(msg.content === '!리스트') {
    if(discussion == false) return msg.reply('토의가 아직 시작되지 않았습니다')
    if(opinions.length == 0) return  msg.channel.send('```diff\n- 아직 의견이 없습니다. !의견추가/[의견]을 이용해 의견을 추가해주세요.```')
    let list
    for(let i = 0; i<opinions.length; i++){
        if(!i == 0) list = list +`\n\n+ ${opinions[i]}`
        else list = `+ ${opinions[i]}`
    }
    msg.channel.send('```diff\n'+list+'```')
    
  }
  else if(msg.content === '!투표시작'){
    if(discussion == false) return msg.reply('토의가 아직 시작되지 않았습니다')
    if(opinions.length == 0) return msg.reply('아직 의견이 없습니다.')
    
    vote = true
    msg.channel.send('투표가 시작됩니다. 원하는 의견에 투표를 해주세요. 투표가 모두 완료되었다면 !투표완료를 입력해 완료해주세요.(예시 : !투표하기 1)')
    let list
    for(let i = 0; i<opinions.length; i++){
        if(!i == 0) list = list +`\n\n+ ${opinions[i]}(${i + 1}번)`
        else list = `+ ${opinions[i]}(${i + 1}번)`
    }
    msg.channel.send('```diff\n'+list+'```')
   
  }

  else if(msg.content.startsWith('!투표하기')){
      let args = msg.content.split(' ')

      if(discussion == false) return msg.reply('토의가 아직 시작되지 않았습니다.')
      if(vote == false) return msg.reply('투표가 아직 시작되지 않았습니다')
      if(isNaN(args[1]) || (args[1] > opinions.length || args[1] < 0)) return msg.reply('투표할 대상을 제대로 적어주세요.')

      if(voteresult[args[1]*=1] == undefined) voteresult[args[1]] = 1
      else voteresult[args[1]*=1] = voteresult[args[1]] + 1

      msg.reply(`투표됨. 현재 ${args[1]}번은 ${voteresult[args[1]]}표입니다.`)
  }
  else if(msg.content === '!투표리스트') {
    if(discussion == false) return msg.reply('토의가 아직 시작되지 않았습니다.')
    if(vote == false) return msg.reply('투표가 아직 시작되지 않았습니다.')
    
    let transfer
    for(let i = 0; i < opinions.length; i++){
     let index = i + 1
     if(voteresult[index] == undefined) voteresult[index] = 0
     if(transfer == undefined) transfer = `${index}번(${opinions[i]}) : ${voteresult[index]}표\n\n`
     else transfer = transfer + `${index}번(${opinions[i]}) : ${voteresult[index]}표\n\n`
    
    }
    msg.channel.send('```주제: '+subject+'\n\n'+transfer+'\n\n```')
  }
    else if(msg.content.startsWith('!토의저장')) {
      if(discussion == false || vote == false) return msg.reply('토의를 저장하려면 토의를 모두 완료해야합니다 (투표까지)')
      fs.readFile('./discussions.json', 'utf8', (err, data) => {
        let id = randtxt.makeid()
        db = JSON.parse(data)
        let transfer
        for(let i = 0; i < opinions.length; i++){
         let index = i + 1
         if(voteresult[index] == undefined) voteresult[index] = 0
         if(transfer == undefined) transfer = `${index}번(${opinions[i]}) : ${voteresult[index]}표\n\n`
         else transfer = transfer + `${index}번(${opinions[i]}) : ${voteresult[index]}표\n\n`
         
        }
        msg.reply(`저장되었습니다. !불러오기 ${id}를 입력해서 저장한 정보를 불러와보세요.`)
        db[id] = {subject : subject, voteresult : transfer}
        db.key = id
        fs.writeFile('./discussions.json', JSON.stringify(db),'utf8', (err) => {})
        
      })
    }
    else if(msg.content.startsWith('!불러오기')){
      fs.readFile('discussions.json', 'utf8', (err, data) => {
        db = JSON.parse(data)
        
        let args = msg.content.split(' ')
      if(db[args[1]]) {
        let dbsubject = db[args[1]].subject
        let dbvoteresult = db[args[1]].voteresult
        msg.reply('```diff\n주제 : '+dbsubject+'\n\n'+dbvoteresult+'```')
      }
      else msg.reply('유효하지 않은 아이디입니다.')
      })
    }

    else if(msg.content === '!종료'){
      if(discussion == false) return msg.reply('이미 토의가 종료되었습니다.')
      msg.reply('토의가 종료되었습니다.')
      discussion = false
      vote = false
      voteresult = {}
      opinions = []
  }
   
});
    

client.login(process.env.TOKEN)
