import React, {Component} from 'react';
import {Text, StyleSheet} from 'react-native';
import {fromCognitoIdentityPool} from '@aws-sdk/credential-provider-cognito-identity';
import {CognitoIdentityClient} from '@aws-sdk/client-cognito-identity';
import {S3Client, ListObjectsCommand} from '@aws-sdk/client-s3';
import {REGION, IDENTITY_POOL_ID, BUCKET} from '../config';

export class TextInANest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      titleText: "SDK response",
      bodyText: 'No response yet',
    };
  }

  render() {
    return (
      <Text style={styles.baseText}>
        <Text style={styles.titleText} onPress={this.onPressTitle}>
          {this.state.titleText}
          {'\n'}
          {'\n'}
        </Text>
        <Text numberOfLines={5}>{this.state.bodyText}</Text>
      </Text>
    );
  }

  async componentDidMount() {
    const client = new S3Client({
      region: REGION,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({
          region: REGION,
        }),
        identityPoolId: IDENTITY_POOL_ID,
      }),
      signingEscapePath: true,
    });
    const result = await client.send(
      new ListObjectsCommand({
        Bucket: BUCKET,
      }),
    );
    this.setState({bodyText: JSON.stringify(result.Contents)});
  }
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
