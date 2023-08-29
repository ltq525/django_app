from channels.generic.websocket import AsyncWebsocketConsumer
import json

class MultiPlayer(AsyncWebsocketConsumer):

    # 创建连接 
    async def connect(self):    
        await self.accept()
        print('accept')

        self.room_name = "room"
        # 加入群连接
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    # 断开连接
    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    # 接受前端向后端发送的请求
    async def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
