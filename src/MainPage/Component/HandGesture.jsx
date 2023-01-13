import * as constants from "../../utils/Constants"

const calculateVectorize = (u, v) =>{
  let difference = [];

  difference[0] = v.x - u.x;
  difference[1] = v.y - u.y;

  return difference;
}

const getVectorMagnitude = (vector) => {
  let magnitude = 0;

  for(let index = 0; index < vector.length; index++){
    magnitude += vector[index]**2;
  }

  return Math.pow(magnitude, 0.5);
}

const getCosAngle = (u, v) => {
  let dotProduct = 0;

  for(let index = 0; index < v.length; index++){
    dotProduct += u[index] * v[index];
  }
  
  let magnitudeOfU = getVectorMagnitude(u);
  let magnitudeOfV = getVectorMagnitude(v);

  let angle = dotProduct / (magnitudeOfU * magnitudeOfV);
  return angle;
}

  export const detectHandGesture = (landmarks) => {
  let threshhold = 0.7;

  for(let index = 0; index < 21; index++){
    landmarks[index].x = parseInt(landmarks[index].x * 800);
    landmarks[index].y = parseInt(landmarks[index].y * 600);
  }

  // palm vector
  let palm_to_index_vector = calculateVectorize(landmarks[0], landmarks[5])
  let palm_to_mid_vector = calculateVectorize(landmarks[0], landmarks[9])
  let palm_to_ring_vector = calculateVectorize(landmarks[0], landmarks[13])
  let palm_to_pinky_vector = calculateVectorize(landmarks[0], landmarks[17])

  // index vector
  let index_vector = calculateVectorize(landmarks[6], landmarks[8])
  let middle_vector = calculateVectorize(landmarks[10], landmarks[12])
  let ring_vector = calculateVectorize(landmarks[14], landmarks[16])
  let pinky_vector = calculateVectorize(landmarks[18], landmarks[20])

  console.log(getCosAngle(palm_to_index_vector, index_vector))

  if (getCosAngle(palm_to_index_vector, index_vector) > threshhold && 
      getCosAngle(index_vector, middle_vector) < 0 &&
      getCosAngle(index_vector, ring_vector) < 0 &&
      getCosAngle(index_vector, pinky_vector) < 0)
        return constants.DRAW;

  return constants.HOVER;
}