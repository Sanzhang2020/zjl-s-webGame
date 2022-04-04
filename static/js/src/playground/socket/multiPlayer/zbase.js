class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app1042.acapp.acwing.com.cn/wss/multiPlayer/");
        this.uuid = null;
        this.start();

    }
    start() {
        this.receive();
    }
    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++) {
            if (players[i].uuid === uuid) {
                return players[i];
            }
        }
        return null;
    }
    receive() {
        let outer = this;
        this.ws.onmessage = function (e) {
            let data = JSON.parse(e.data);
            //console.log(data);
            let uuid = data.uuid;
            console.log('uuid:' + uuid + 'this.uuid' + outer.uuid);
            if (uuid === outer.uuid) {
                return false;
            }

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
            else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.b_uuid);
            } else if (event === "attack") {
                outer.receive_attack(uuid, data.attacked_uuid, data.x, data.y, data.angle, data.damage, data.b_uuid);
            }
        }
    }
    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }
    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }
    receive_create_player(uuid, username, photo) {

        let Player = new player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo
        );
        //console.log('player ' + Player);
        Player.uuid = uuid;
        this.playground.players.push(Player);
    }

    receive_move_to(uuid, tx, ty) {
        let plyer = this.get_player(uuid);
        //console.log(plyer);
        if (plyer) {
            plyer.move_to(tx, ty);
        }
    }
    //同步普通攻击
    send_shoot_fireball(tx, ty, b_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'b_uuid': b_uuid,
        }));
    }
    receive_shoot_fireball(uuid, tx, ty, b_uuid) {
        let player_shoot = this.get_player(uuid);
        if (player_shoot) {
            let fireballTemp = player_shoot.shoot_fireball(tx, ty);
            fireballTemp.uuid = b_uuid;
        }
    }
    send_attack(attacked_uuid, x, y, angle, damage, b_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attacked_uuid': attacked_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'b_uuid': b_uuid,
        }));
    }
    receive_attack(uuid, attacked_uuid, x, y, angle, damage, b_uuid) {
        let attacker = this.get_player(uuid);
        let attackeder = this.get_player(attacked_uuid);
        if (attackeder && attacker) {
            attackeder.receive_attack(x, y, angle, damage, b_uuid, attacker);
        }
    }
}

