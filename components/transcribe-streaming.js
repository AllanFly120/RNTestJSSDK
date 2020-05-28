import React, {Component} from 'react';
import {Text, StyleSheet, Button, View} from 'react-native';
import {fromCognitoIdentityPool} from '@aws-sdk/credential-provider-cognito-identity';
import {CognitoIdentityClient} from '@aws-sdk/client-cognito-identity';
import {REGION, IDENTITY_POOL_ID} from '../config';
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from '@aws-sdk/client-transcribe-streaming';

export class TranscribeFromAudio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transcript: 'Hello World!!',
    };
    this.transcribeClient = new TranscribeStreamingClient({
      region: REGION,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({
          region: REGION,
        }),
        identityPoolId: IDENTITY_POOL_ID,
      }),
    });
    this.audioStreamDone = true;
  }

  render() {
    return (
      <View>
        <Button onPress={this.startRecording(this)} title="Start" />
        <Button onPress={this.stopRecording(this)} title="Stop" />
        <Text style={styles.baseText}>
          <Text style={styles.baseText} onPress={this.onPressTitle}>
            {this.state.transcript}
            {'\n'}
            {'\n'}
          </Text>
        </Text>
      </View>
    );
  }

  startRecording = env => async () => {
    const self = env;
    self.audioStreamDone = false;
    async function* input() {
      while (!self.audioStreamDone) {
        await new Promise(resolve => {
          setTimeout(resolve, 10);
        });
        yield Promise.resolve({
          AudioEvent: {AudioChunk: Uint8Array.from([1,1,1,1,1,1,1,1])}
        });
      }
    }
    const resp = await this.transcribeClient.send(
      new StartStreamTranscriptionCommand({
        LanguageCode: 'en-US',
        MediaSampleRateHertz: 44100,
        MediaEncoding: 'pcm',
        AudioStream: input(),
      }),
    );
    console.log('response: ', resp);
    const generator = resp.TranscriptResultStream[Symbol.asyncIterator]();
    while (true) {
      const {done, value} = await generator.next();
      if (done) break;
      console.log(value);
    }
  };

  stopRecording = env => () => {
    env.audioStreamDone = true;
  };
}

const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'Cochin',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
