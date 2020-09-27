import React, { Component } from 'react';
import SwaggerUi, { presets } from 'swagger-ui';
import { SSE_URL } from "../config/enviromentConfig"
import 'swagger-ui/dist/swagger-ui.css';

//public sever. ? default_config . baseURL
class SwaggerTest extends Component {

  componentDidMount() {
    SwaggerUi({
      dom_id: '#swaggerContainer',
      url: `${SSE_URL}swag`,
      presets: [presets.apis],
    });
  }

  render() {
    return (
      <div id="swaggerContainer" />
    );
  }
}

export default SwaggerTest;