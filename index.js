const Discord = require('discord.js'); // 모듈을 가져온 뒤,
const client = new Discord.Client(); // Discord.Client 객체 생성.
let opinions = []
let subject
let discussion = false
let vote = false
let voteresult = {}
client.on('ready', () => { // 이벤트 리스너 (ready 이벤트)
  console.log(`Ready!`)
});

client.on('message', (msg) => { // 이벤트 리스너 (message 이벤트)
 if(msg.content == '!도움') {
  const exampleEmbed = new Discord.MessageEmbed()
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
    { name: '종료', value: '투표를 종료합니다.'},
	)

	.setTimestamp()
	.setFooter('!도움', msg.author.avatarURL());

msg.channel.send(exampleEmbed);
 }
  
  else if (msg.content.startsWith('!토의시작')) { // discord.Message.content 속성이 'ping'과 같을 떄
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
    if(opinions.length == 0) return  msg.channel.send('```diff\n- 아직 의견이 없습니다. !의견내기/[의견]을 이용해 의견을 추가해주세요.```')
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