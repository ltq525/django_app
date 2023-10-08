from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    # 创建连接 
    async def connect(self):  
        self.room_name = None 
        for i in range(1000):
            name = "room-%d" % i
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break
        
        if not self.room_name:
            return

        await self.accept()
        print('accept')

        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600) # 有效期1小时

        for player in cache.get(self.room_name):
            # 发送信息给前端
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

        # 加入群连接
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    # 断开连接 如果需要维护在线人数时 此函数不靠谱
    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo'],
        })
        cache.set(self.room_name, players, 3600) # 有效期1小时
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_create_player",
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],
            }
                                            
        )
    # 此类名需要与上面type名相同
    async def group_create_player(self, data):
        await self.send(text_data=json.dumps(data))

    # 接受前端向后端发送的请求
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        
        if event == "create_player":
            await self.create_player(data)
            print(data)
        
