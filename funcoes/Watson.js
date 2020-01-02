const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
const apiKeys = require('../app.json');

const conversation = new AssistantV2({
  version: apiKeys.watsonVersion,
  authenticator: new IamAuthenticator({
    apikey: apiKeys.apikey,
  }),
  url: 'https://gateway.watsonplatform.net/assistant/api',
});

async function newWatsonSes() {
	return await conversation.createSession({
		assistantId: apiKeys.assistantId
	})
}


const userSession = [];
async function createSession (user){
	const findUser = userSession.filter(item => item.id === user )
	if(findUser[0] === undefined){
		key = await newWatsonSes().then( async res => {
			const session_id = await res.result.session_id
			const newUser = {
				id: user,
				session: session_id
			}
			userSession.push(newUser)
			return newUser.session;
		})
		console.log('ses: ',key);
		return key;
	} else {
		return findUser[0].session;
	}
}

function sendMessage(msg, ses) {
	console.log(msg)
	return conversation.message({
		assistantId: apiKeys.assistantId,
		sessionId: ses,
		input: {
		  'message_type': 'text',
		  'text': msg,
			options: {
				return_context: true
			},
		},
		context: {
      global: {
        system: {
          user_id: ses
        }
      },
      skills: {
        'main skill': {
          user_defined: {}
        }
      }
    }
	})
} 
async function deleteSession (user){
	const findUser = userSession.indexOf(item => item.id === user )
	userSession.pop(findUser)
}

module.exports = {deleteSession, createSession, sendMessage}