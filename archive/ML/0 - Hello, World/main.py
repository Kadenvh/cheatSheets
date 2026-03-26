import tensorflow as tf
import numpy as np
from tensorflow import keras

# create simple nueral network; one nueron, one layer
model = tf.keras.Sequential([
    keras.layers.Input(shape=[1]),
    keras.layers.Dense(units=1)
])

model.compile(optimizer='sgd', loss='mean_squared_error')

xs = np.array([-1.0, 0.0, 1.0, 2.0, 3.0, 4.0], dtype=float)
ys = np.array([-2.0, 1.0, 4.0, 7.0, 10.0, 13.0], dtype=float)

model.fit(xs, ys, epochs=500)

input_value = np.array([10.0])
prediction = model.predict(input_value)
print(prediction)

# Returns 30.415 for 50 Epoch's & 30.001 for 500