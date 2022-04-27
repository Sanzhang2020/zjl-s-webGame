class zsGameMenu{constructor(t,s){this.root=t,this.OS=s,this.$menu=$('\n<div class="zs-game-menu">\n    <div class="zs-game-menu-field">\n        <div class="zs-game-menu-field-item zs-game-menu-field-item-single">\n            单人模式\n        </div>\n        <div class="zs-game-menu-field-item zs-game-menu-field-item-multi">\n            多人模式\n        </div>\n        <div class="zs-game-menu-field-item zs-game-menu-field-item-settings">\n            设置\n        </div>\n    </div>\n</div>        \n'),this.$menu.hide(),this.root.$zs_game.append(this.$menu),this.$single=this.$menu.find(".zs-game-menu-field-item-single"),this.$multi=this.$menu.find(".zs-game-menu-field-item-multi"),this.$settings=this.$menu.find(".zs-game-menu-field-item-settings"),this.start()}start(){this.add_listening_events()}add_listening_events(){let t=this;this.$single.click((function(){t.hide(),t.root.playground.show("single mode")})),this.$multi.click((function(){t.hide(),t.root.playground.show("multi mode")})),this.$settings.click((function(){t.root.settings.logout_on_remote()}))}show(){this.$menu.show()}hide(){this.$menu.hide()}}let last_timestamp,zs_game_objects=[];class GameObject{constructor(){zs_game_objects.push(this),this.isStarted=!1,this.timedelta=0,this.uuid=this.create_uuid()}late_update(){}create_uuid(){let t="";for(let s=0;s<8;s++){t+=parseInt(Math.floor(10*Math.random()))}return t}start(){}update(){}on_destroy(){}destroy(){this.on_destroy();for(let t=0;t<zs_game_objects.length;t++)if(zs_game_objects[t]===this){zs_game_objects.splice(t,1);break}}}let ZS_GAME_ANIMATION=function(t){for(let s=0;s<zs_game_objects.length;s++){let i=zs_game_objects[s];i.late_update(),i.isStarted?(i.timedelta=t-last_timestamp,i.update()):(i.start(),i.isStarted=!0)}last_timestamp=t,requestAnimationFrame(ZS_GAME_ANIMATION)};requestAnimationFrame(ZS_GAME_ANIMATION);class ChatField{constructor(t){this.playground=t,this.$history=$('<div class = "zs-game-chat-field-history">历史记录</div>'),this.$input=$('<input type="text" class="zs-game-chat-field-input">'),this.$history.hide(),this.$input.hide(),this.func_id=null,this.playground.$playground.append(this.$history),this.playground.$playground.append(this.$input),this.start()}start(){this.add_listening_events()}add_listening_events(){let t=this;this.$input.keydown((function(s){if(27===s.which)return t.hide_input(),!1;if(13===s.which){let s=t.playground.root.settings.username,i=t.$input.val();return i&&(t.$input.val(""),t.add_message(s,i),t.playground.mps.send_message(s,i)),!1}}))}render_message(t){return $(`<div>${t}</div>`)}add_message(t,s){this.show_history();let i=`[${t}]${s}`;this.$history.append(this.render_message(i)),this.$history.scrollTop(this.$history[0].scrollHeight)}show_history(){let t=this;this.$history.fadeIn(),this.func_id&&clearTimeout(this.func_id),this.func_id=setTimeout((function(){t.$history.fadeOut(),t.func_id=null}),3e3)}show_input(){this.show_history(),this.$input.show(),this.$input.focus()}hide_input(){this.$input.hide(),this.playground.gameMap.$canvas.focus()}}class gameMap extends GameObject{constructor(t){super(),this.playground=t,this.$canvas=$("<canvas tabindex=0></canvas>"),this.ctx=this.$canvas[0].getContext("2d"),this.ctx.canvas.width=this.playground.width,this.ctx.canvas.height=this.playground.height,this.playground.$playground.append(this.$canvas)}start(){this.$canvas.focus()}resize(){this.ctx.canvas.width=this.playground.width,this.ctx.canvas.height=this.playground.height,this.ctx.fillStyle="rgba(0, 0, 0, 1)",this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height)}update(){this.render()}render(){this.ctx.fillStyle="rgb(0, 0, 0, 0.2)",this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height)}}class NoticeBoard extends GameObject{constructor(t){super(),this.playground=t,this.ctx=this.playground.gameMap.ctx,this.text="已就绪 0 人"}start(){}write(t){this.text=t}update(){this.render()}render(){this.ctx.font="20px serif",this.ctx.fillStyle="white",this.ctx.textAlign="center",this.ctx.fillText(this.text,this.playground.width/2,20)}}class particle extends GameObject{constructor(t,s,i,e,a,n,h,r){super(),this.playground=t,this.ctx=this.playground.gameMap.ctx,this.x=s,this.y=i,this.radius=e,this.color=a,this.vx=n,this.vy=h,this.speed=r,this.eps=.01}render(){this.scale=this.playground.scale,this.ctx.beginPath(),this.ctx.arc(this.x*this.scale,this.y*this.scale,this.radius*this.scale,0,2*Math.PI,!1),this.ctx.fillStyle=this.color,this.ctx.fill()}start(){this.frition_speed=.8,this.frition_radius=.8}update(){this.render(),this.update_move()}update_move(){if(this.speed<this.eps||this.radius<this.eps)return this.destroy(),!1;this.x+=this.vx*this.speed*this.timedelta/1e3,this.y+=this.vy*this.speed*this.timedelta/1e3,this.speed*=this.frition_speed,this.radius*=this.frition_radius}}class player extends GameObject{constructor(t,s,i,e,a,n,h,r,l){super(),this.playground=t,this.ctx=this.playground.gameMap.ctx,this.x=s,this.y=i,this.vx=0,this.vy=0,this.damage_x=0,this.damage_y=0,this.damage_speed=0,this.radius=e,this.color=a,this.character=h,this.username=r,this.photo=l,this.speed=n,this.eps=.01,this.move_length=0,this.cur_skill=null,this.frition_damage=0,this.spend_time=0,this.fireballs=[],"robot"!==this.character&&(this.img=new Image,this.img.src=this.photo),"me"===this.character&&(this.fireball_cold_time=3,this.fireball_img=new Image,this.fireball_img.src="https://s3.bmp.ovh/imgs/2022/04/04/dd4c4eb08b35c383.jpg",this.blink_coldtime=5,this.blink_img=new Image,this.blink_img.src="https://s3.bmp.ovh/imgs/2022/04/04/f4d9157dda4e7740.png")}start(){let t=this;if(this.playground.player_count++,this.playground.noticeBoard.write("已就绪："+this.playground.player_count+"人"),this.playground.player_count>=3){this.playground.state="fighting";var s=Date.now();setInterval((function(){var i=Date.now(),e=Math.trunc((i-s)/1e3);t.playground.noticeBoard.write(getTimeFormat(e))}),1e3)}this.cold_time=5,"me"===this.character&&this.add_listening_events()}update(){this.spend_time+=this.timedelta/1e3,this.render(),"me"===this.character&&"fighting"===this.playground.state&&this.update_cold_time(),this.update_win(),this.update_move(),this.update_AI()}update_win(){"fighting"===this.playground.state&&"me"===this.character&&1===this.playground.players.length&&(this.playground.state="over",this.playground.score_board.win())}render(){let t=this.playground.scale;"robot"!==this.character?(this.ctx.save(),this.ctx.beginPath(),this.ctx.arc(this.x*t,this.y*t,this.radius*t,0,2*Math.PI,!1),this.ctx.stroke(),this.ctx.clip(),this.ctx.drawImage(this.img,(this.x-this.radius)*t,(this.y-this.radius)*t,2*this.radius*t,2*this.radius*t),this.ctx.restore()):(this.ctx.beginPath(),this.ctx.arc(this.x*t,this.y*t,this.radius*t,0,2*Math.PI,!1),this.ctx.fillStyle=this.color,this.ctx.fill()),"me"===this.character&&"fighting"===this.playground.state&&this.render_skill_coldtime()}render_skill_coldtime(){let t=this.playground.scale,s=1.5,i=.9,e=.04;this.ctx.save(),this.ctx.beginPath(),this.ctx.arc(s*t,i*t,e*t,0,2*Math.PI,!1),this.ctx.stroke(),this.ctx.clip(),this.ctx.drawImage(this.fireball_img,(s-e)*t,(i-e)*t,2*e*t,2*e*t),this.ctx.restore(),this.fireball_cold_time>0&&(this.ctx.beginPath(),this.ctx.moveTo(s*t,i*t),this.ctx.arc(s*t,i*t,e*t,0-Math.PI/2,2*Math.PI*(1-this.fireball_cold_time/3)-Math.PI/2,!0),this.ctx.lineTo(s*t,i*t),this.ctx.fillStyle="rgb(0, 0, 255, 0.6)",this.ctx.fill()),s=1.62,i=.9,e=.04,this.ctx.save(),this.ctx.beginPath(),this.ctx.arc(s*t,i*t,e*t,0,2*Math.PI,!1),this.ctx.stroke(),this.ctx.clip(),this.ctx.drawImage(this.blink_img,(s-e)*t,(i-e)*t,2*e*t,2*e*t),this.ctx.restore(),this.blink_coldtime>0&&(this.ctx.beginPath(),this.ctx.moveTo(s*t,i*t),this.ctx.arc(s*t,i*t,e*t,0-Math.PI/2,2*Math.PI*(1-this.blink_coldtime/5)-Math.PI/2,!0),this.ctx.lineTo(s*t,i*t),this.ctx.fillStyle="rgb(0, 0, 255, 0.6)",this.ctx.fill())}destroy_fireball(t){for(let s=0;s<this.fireballs.length;s++){let i=this.fireballs[s];if(i.uuid=t){i.destroy();break}}}blink(t,s){let i=getDist(this.x,this.y,t,s);i=Math.min(i,.8);let e=Math.atan2(s-this.y,t-this.x);this.x+=i*Math.cos(e),this.y+=i*Math.sin(e),this.blink_coldtime=5,this.move_length=0}on_destroy(){"me"===this.character&&"fighting"===this.playground.state&&(this.playground.state="over",this.playground.score_board.lose());for(let t=0;t<this.playground.players.length;t++){if(this.playground.players[t]===this){this.playground.players.splice(t,1);break}}}add_listening_events(){let t=this;this.playground.gameMap.$canvas.on("contextmenu",(function(){return!1})),this.playground.gameMap.$canvas.mousedown((function(s){if("fighting"!==t.playground.state)return!0;let i=s.which;const e=t.ctx.canvas.getBoundingClientRect();if(3==i){let i=(s.clientX-e.left)/t.playground.scale,a=(s.clientY-e.top)/t.playground.scale;t.move_to(i,a),"multi mode"===t.playground.mode&&t.playground.mps.send_move_to(i,a)}else if(1===i){let i=(s.clientX-e.left)/t.playground.scale,a=(s.clientY-e.top)/t.playground.scale;if("fireball"===t.cur_skill){if(t.fireball_cold_time>t.eps)return!1;let s=t.shoot_fireball(i,a);return"multi mode"===t.playground.mode&&t.playground.mps.send_shoot_fireball(i,a,s.uuid),!1}if("blink"===t.cur_skill){if(t.blink_coldtime>t.eps)return!1;"multi mode"===t.playground.mode&&t.playground.mps.send_blink(i,a),t.blink(i,a)}t.cur_skill=null}})),this.playground.gameMap.$canvas.keydown((function(s){if(13===s.which){if("multi mode"===t.playground.mode)return t.playground.chat_field.show_input(),!1}else 27===s.which&&"multi mode"===t.playground.mode&&t.playground.chat_field.hide_input();if("fighting"!==t.playground.state)return!0;let i=s.which;return 81===i?t.fireball_cold_time>t.eps||(t.cur_skill="fireball",!1):70===i?t.blink_coldtime>t.eps||(t.cur_skill="blink",!1):void 0}))}move_to(t,s){this.move_length=getDist(this.x,this.y,t,s);let i=t-this.x,e=s-this.y,a=Math.atan2(e,i);this.vx=Math.cos(a),this.vy=Math.sin(a)}update_move(){if(this.damage_speed>this.eps)this.vx=this.vy=0,this.move_length=0,this.x+=this.damage_x*this.damage_speed*this.timedelta/1e3,this.y+=this.damage_y*this.damage_speed*this.timedelta/1e3,this.damage_speed*=this.frition_damage;else if(this.move_length<this.eps)this.move_length=0,this.vx=this.vy=0;else{let t=Math.min(this.move_length,this.speed*this.timedelta/1e3);this.x+=this.vx*t,this.y+=this.vy*t,this.move_length-=t}}update_cold_time(){this.fireball_cold_time-=this.timedelta/1e3,this.fireball_cold_time=Math.max(this.fireball_cold_time,0),this.blink_coldtime-=this.timedelta/1e3,this.blink_coldtime=Math.max(this.blink_coldtime,0)}shoot_fireball(t,s){let i=this.x,e=this.y,a=Math.atan2(s-this.y,t-this.x),n=Math.cos(a),h=Math.sin(a),r=new fireball(this.playground,this,i,e,.01,"orange",.01,n,h,.5,.5);return this.fireballs.push(r),this.fireball_cold_time=3,r}update_AI(){return"robot"===this.character&&(this.update_AI_move(),!!this.update_AI_cold_time()&&void this.update_AI_shoot_fireball())}update_AI_move(){if(this.move_length<this.eps){let t=Math.random()*this.playground.width/this.playground.scale,s=Math.random()*this.playground.height/this.playground.scale;this.move_to(t,s)}}is_Attacked(t){let s=Math.atan2(this.y-t.y,this.x-t.x),i=t.damage;this.isAttacked_concrete(s,i)}isAttacked_concrete(t,s){if(this.explode_particle(),this.radius-=s,this.frition_damage=.8,this.isDied())return!1;this.damage_x=Math.cos(t),this.damage_y=Math.sin(t),this.damage_speed=100*s,this.speed*=1.2}receive_attack(t,s,i,e,a,n){n.destroy_fireball(a),this.x=t,this.y=s,this.isAttacked_concrete(i,e)}isDied(){return this.radius*this.playground.scale<this.eps&&(this.destroy(),!0)}explode_particle(){for(let t=0;t<10+5*Math.random();t++){let t=this.x,s=this.y,i=this.radius/3,e=2*Math.PI*Math.random(),a=Math.cos(e),n=Math.sin(e),h=this.color,r=10*this.speed;new particle(this.playground,t,s,i,h,a,n,r)}}update_AI_cold_time(){return!(this.cold_time>0)||(this.cold_time-=this.timedelta/1e3,!1)}update_AI_shoot_fireball(){if(Math.random()<1/180){let t=this.playground.players[Math.floor(Math.random()*this.playground.players.length)];this.shoot_fireball(t.x,t.y)}}}let getDist=function(t,s,i,e){let a=i-t,n=e-s;return Math.sqrt(a*a+n*n)};const getTimeFormat=t=>{let s="";return s+=`${Math.floor(t/3600)}:`,s+=`${Math.floor(t/60%60)}:`,s+=`${Math.floor(t%60)}`,s};class ScoreBoard extends GameObject{constructor(t){super(),this.playground=t,this.ctx=this.playground.gameMap.ctx,this.state=null,this.win_img=new Image,this.win_img.src="https://s1.328888.xyz/2022/04/11/fHRdi.png",this.lose_img=new Image,this.lose_img.src="https://s1.328888.xyz/2022/04/11/fqbVm.jpg"}start(){}add_listening_events(){let t=this;this.playground.gameMap.$canvas.on("click",(function(){t.playground.hide(),t.playground.root.menu.show()}))}win(){this.state="win";let t=this;setTimeout((function(){t.add_listening_events()}),1e3)}lose(){this.state="lose";let t=this;setTimeout((function(){t.add_listening_events()}),1e3)}late_update(){this.render()}render(){let t=this.playground.height/2;"win"===this.state?this.ctx.drawImage(this.win_img,this.playground.width/2-t/2,this.playground.height/2-t/2,t,t):"lose"===this.state&&this.ctx.drawImage(this.lose_img,this.playground.width/2-t/2,this.playground.height/2-t/2,t,t)}}class fireball extends GameObject{constructor(t,s,i,e,a,n,h,r,l,o,d){super(),this.playground=t,this.ctx=this.playground.gameMap.ctx,this.player=s,this.x=i,this.y=e,this.radius=a,this.color=n,this.damage=h,this.vx=r,this.vy=l,this.speed=o,this.move_dist=d,this.eps=.01}render(){this.scale=this.playground.scale,this.ctx.beginPath(),this.ctx.arc(this.x*this.scale,this.y*this.scale,this.radius*this.scale,0,2*Math.PI,!1),this.ctx.fillStyle=this.color,this.ctx.fill()}start(){}update(){this.update_move(),this.render(),"enemy"!==this.player.character&&this.update_attack()}update_move(){if(this.move_dist<this.eps)return this.destroy(),!1;{let t=Math.min(this.move_dist,this.speed*this.timedelta/1e3);this.x+=this.vx*t,this.y+=this.vy*t,this.move_dist-=t}}is_satisfy_collision(t){return this!==t&&(this.player!==t&&isCollision(this,t))}hit(t){t.is_Attacked(this);let s=Math.atan2(t.y-this.y,t.x-this.x);console.log(t),(this.playground.mode="multi mode")&&this.playground.mps.send_attack(t.uuid,t.x,t.y,s,this.damage,this.uuid),this.isAttacked(t)}isAttacked(t){this.isAttacked_concrete(0,0)}isAttacked_concrete(t,s){this.destroy()}update_attack(){for(let t=0;t<this.playground.players.length;t++){let s=this.playground.players[t];if(this.is_satisfy_collision(s)){this.hit(s);break}}}on_destroy(){let t=this.player.fireballs;for(let s=0;s<t.length;s++)if(t[s]===this){t.splice(s,1);break}}}let isCollision=function(t,s){return getDist(t.x,t.y,s.x,s.y)<t.radius+s.radius};class MultiPlayerSocket{constructor(t){this.playground=t,this.ws=new WebSocket("wss://app1042.acapp.acwing.com.cn/wss/multiPlayer/"),this.uuid=null,this.start()}start(){this.receive()}get_player(t){let s=this.playground.players;for(let i=0;i<s.length;i++)if(s[i].uuid===t)return s[i];return null}receive(){let t=this;this.ws.onmessage=function(s){let i=JSON.parse(s.data),e=i.uuid;if(console.log("uuid:"+e+"this.uuid"+t.uuid),e===t.uuid)return!1;let a=i.event;"create_player"===a?t.receive_create_player(e,i.username,i.photo):"move_to"===a?t.receive_move_to(e,i.tx,i.ty):"shoot_fireball"===a?t.receive_shoot_fireball(e,i.tx,i.ty,i.b_uuid):"attack"===a?t.receive_attack(e,i.attacked_uuid,i.x,i.y,i.angle,i.damage,i.b_uuid):"blink"===a?t.receive_blink(e,i.tx,i.ty):"message"===a&&t.receive_message(e,i.username,i.text)}}send_create_player(t,s){this.ws.send(JSON.stringify({event:"create_player",uuid:this.uuid,username:t,photo:s}))}send_move_to(t,s){this.ws.send(JSON.stringify({event:"move_to",uuid:this.uuid,tx:t,ty:s}))}receive_create_player(t,s,i){let e=new player(this.playground,this.playground.width/2/this.playground.scale,.5,.05,"white",.15,"enemy",s,i);e.uuid=t,this.playground.players.push(e)}receive_move_to(t,s,i){let e=this.get_player(t);e&&e.move_to(s,i)}send_shoot_fireball(t,s,i){this.ws.send(JSON.stringify({event:"shoot_fireball",uuid:this.uuid,tx:t,ty:s,b_uuid:i}))}receive_shoot_fireball(t,s,i,e){let a=this.get_player(t);if(a){a.shoot_fireball(s,i).uuid=e}}send_attack(t,s,i,e,a,n){this.ws.send(JSON.stringify({event:"attack",uuid:this.uuid,attacked_uuid:t,x:s,y:i,angle:e,damage:a,b_uuid:n}))}receive_attack(t,s,i,e,a,n,h){let r=this.get_player(t),l=this.get_player(s);l&&r&&l.receive_attack(i,e,a,n,h,r)}send_blink(t,s){this.ws.send(JSON.stringify({event:"blink",uuid:this.uuid,tx:t,ty:s}))}receive_blink(t,s,i){let e=this.get_player(t);e&&e.blink(s,i)}send_message(t,s){this.ws.send(JSON.stringify({event:"message",uuid:this.uuid,username:t,text:s}))}receive_message(t,s,i){this.playground.chat_field.add_message(s,i)}}class zsGamePlayground{constructor(t){this.root=t,this.$playground=$('<div class="zs-game-playground"></div>'),this.hide(),this.root.$zs_game.append(this.$playground),this.mps=new MultiPlayerSocket(this),this.start()}create_uuid(){let t="";for(let s=0;s<8;s++){t+=parseInt(Math.floor(10*Math.random()))}return t}start(){let t=this,s=this.create_uuid;$(window).resize((function(){t.resize()})),this.root.OS&&t.root.OS.api.window.on_close((function(){$(window).off(`resize.${s}`)}))}resize(){this.width=this.$playground.width(),this.height=this.$playground.height();let t=Math.min(this.width/16,this.height/9);this.width=16*t,this.height=9*t,this.scale=this.height,this.gameMap&&this.gameMap.resize()}show(t){if(this.$playground.show(),this.width=this.$playground.width(),this.height=this.$playground.height(),this.gameMap=new gameMap(this),this.mode=t,this.state="waiting",this.noticeBoard=new NoticeBoard(this),this.score_board=new ScoreBoard(this),this.player_count=0,this.resize(),this.players=[],this.players.push(new player(this,this.width/2/this.scale,.5,.05,"white",.15,"me",this.root.settings.username,this.root.settings.photo)),"single mode"===t)for(let t=0;t<5;t++)this.players.push(new player(this,this.width/2/this.scale,.5,.05,GET_RANDOM_COLOR(),.15,"robot"));else if("multi mode"===t){let t=this;this.chat_field=new ChatField(this),this.mps=new MultiPlayerSocket(this),this.mps.uuid=this.players[0].uuid,this.mps.ws.onopen=function(){t.mps.send_create_player(t.root.settings.username,t.root.settings.photo)}}}hide(){for(;this.players&&this.players.length>0;)this.players[0].destroy();this.gameMap&&(this.gameMap.destroy(),this.gameMap=null),this.notice_board&&(this.notice_board.destroy(),this.notice_board=null),this.score_board&&(this.score_board.destroy(),this.score_board=null),this.$playground.empty(),this.$playground.hide()}}let GET_RANDOM_COLOR=function(){let t="#";for(let s=0;s<6;s++)t+=(16*Math.random()|0).toString(16);return t};class Settings{constructor(t){this.root=t,this.platform="WEB",this.root.OS&&(this.platform="ACAPP"),this.username="",this.photo="",this.$settings=$('\n<div class="zs-game-settings">\n        <div class="zs-game-settings-login">\n            <div class="zs-game-settings-title"> \n                登录\n            </div>\n            <div class="zs-game-settings-username">\n                <div class="zs-game-settings-item">\n                    <input type="text" placeholder="请输入用户名">\n                </div>\n            </div>\n            <div class="zs-game-settings-password">\n                <div class="zs-game-settings-item">\n                    <input type="password" placeholder="请输入密码">\n                </div>\n            </div>\n            <div class="zs-game-settings-submit">\n                <div class="zs-game-settings-item">\n                    <button>登录</button>\n                </div>\n            </div>\n            <div class="zs-game-settings-errorMessage">\n                \n            </div>\n            <div class="zs-game-settings-option">\n                注册\n            </div>\n            <br>\n            <div class="zs-game-settings-loginWay">\n                更多登录方式:\n                <span class="zs-game-settings-loginWay-Acwing">\n                    <img src="/static/image/settings/acwing.png" width="16", height="16" alt="acwing图标">\n                </span>\n                <span class="zs-game-settings-loginWay-tencent">\n                    <img src="/static/image/settings/QQLogo.png" width="16" height="16" alt="qq图标">\n                </span>\n            </div>\n        </div>\n\n        <div class="zs-game-settings-register">\n            <div class="zs-game-settings-title"> \n                注册\n            </div>\n            <div class="zs-game-settings-username">\n                <div class="zs-game-settings-item">\n                    <input type="text" placeholder="用户名">\n                </div>\n            </div>\n            <div class="zs-game-settings-password zs-game-settings-password-first">\n                <div class="zs-game-settings-item">\n                    <input type="password" placeholder="密码">\n                </div>\n            </div>\n            <div class="zs-game-settings-password zs-game-settings-password-second">\n                <div class="zs-game-settings-item">\n                    <input type="password" placeholder="确认密码">\n                </div>\n            </div>\n            <div class="zs-game-settings-submit">\n                <div class="zs-game-settings-item">\n                    <button>注册</button>\n                </div>\n            </div>\n            <div class="zs-game-settings-errorMessage">\n                \n            </div>\n            <div class="zs-game-settings-option">\n                登录\n            </div>\n            <br>\n            <div class="zs-game-settings-loginWay">\n                更多登录方式:\n                <span class="zs-game-settings-loginWay-Acwing">\n                    <img src="/static/image/settings/acwing.png" width="16", height="16" alt="acwing图标">\n                </span>\n                <span class="zs-game-settings-loginWay-tencent">\n                    <img src="/static/image/settings/QQLogo.png" width="16" height="16" alt="qq图标">\n                </span>\n            </div>\n        </div>\n</div>\n        '),this.root.$zs_game.append(this.$settings),this.$register=this.$settings.find(".zs-game-settings-register"),this.$register_username=this.$register.find(".zs-game-settings-username input"),this.$register_password=this.$register.find(".zs-game-settings-password-first input"),this.$register_password_confirm=this.$register.find(".zs-game-settings-password-second input"),this.$register_submit=this.$register.find(".zs-game-settings-submit button"),this.$register_errorMessage=this.$register.find(".zs-game-settings-errorMessage"),this.$register_login=this.$register.find(".zs-game-settings-option"),this.$login=this.$settings.find(".zs-game-settings-login"),this.$login_username=this.$login.find(".zs-game-settings-username input"),this.$login_password=this.$login.find(".zs-game-settings-password input"),this.$login_submit=this.$login.find(".zs-game-settings-submit button"),this.$login_errorMessage=this.$login.find(".zs-game-settings-errorMessage"),this.$login_register=this.$login.find(".zs-game-settings-option"),this.$acwing_login=this.$settings.find(".zs-game-settings-loginWay-Acwing"),this.$register.hide(),this.$login.hide(),this.start()}start(){"ACAPP"===this.platform?this.getinfo_acapp():(this.getinfo_web(),this.add_listening_events())}getinfo_web(){let t=this;$.ajax({url:"https://app1042.acapp.acwing.com.cn/settings/getinfo/",type:"GET",data:{platform:t.platform},success:function(s){console.log(s),"success"===s.result?(t.username=s.username,t.photo=s.photo,t.hide(),t.root.menu.show()):t.login()}})}getinfo_acapp(){let t=this;$.ajax({url:"https://app1042.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",type:"GET",success:function(s){"success"===s.result&&t.acapp_login(s.appid,s.redirect_uri,s.scope,s.state)}})}acapp_login(t,s,i,e){let a=this;this.root.AcWingOS.api.oauth2.authorize(t,s,i,e,(function(t){"success"===t.result&&(a.username=t.username,a.photo=t.photo,a.hide(),a.root.menu.show())}))}register(){this.$login.hide(),this.$register.show()}login(){this.$register.hide(),this.$login.show()}hide(){this.$settings.hide()}show(){this.$settings.show()}add_listening_events(){let t=this;this.add_listening_events_login(),this.add_listening_events_register(),this.$acwing_login.click((function(){t.acwing_login()}))}acwing_login(){$.ajax({url:"https://app1042.acapp.acwing.com.cn/settings/acwing/web/apply_code/",type:"GET",success:function(t){console.log(t),"success"===t.result&&window.location.replace(t.apply_code_url)}})}add_listening_events_login(){let t=this;this.$login_register.click((function(){t.register()})),this.$login_submit.click((function(){t.login_on_remote()}))}add_listening_events_register(){let t=this;this.$register_login.click((function(){t.login()})),this.$register_submit.click((function(){t.register_on_remote()}))}register_on_remote(){let t=this,s=this.$register_username.val(),i=this.$register_password.val(),e=this.$register_password_confirm.val();this.$register_errorMessage.empty(),$.ajax({url:"https://app1042.acapp.acwing.com.cn/settings/register/",type:"GET",data:{username:s,password:i,password_confirm:e},success:function(s){console.log(s),"success"===s.result?location.reload():t.$register_errorMessage.html(s.result)}})}login_on_remote(){let t=this,s=this.$login_username.val(),i=this.$login_password.val();this.$login_errorMessage.empty(),$.ajax({url:"https://app1042.acapp.acwing.com.cn/settings/login/",type:"GET",data:{username:s,password:i},success:function(s){console.log(s),"success"===s.result?location.reload():t.$login_errorMessage.html(s.result)}})}logout_on_remote(){if("ACAPP"===this.platform)return!1;$.ajax({url:"https://app1042.acapp.acwing.com.cn/settings/logout/",type:"GET",success:function(t){console.log(t),"success"===t.result&&location.reload()}})}}export class zsGame{constructor(t,s){this.id=t,this.$zs_game=$("#"+t),this.OS=s,this.settings=new Settings(this),this.menu=new zsGameMenu(this),this.playground=new zsGamePlayground(this),this.start()}start(){}}
