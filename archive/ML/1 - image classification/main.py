import tensorflow as tf

# Load and preprocess MNIST dataset
mnist = tf.keras.datasets.mnist
(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train, x_test = x_train / 255.0, x_test / 255.0  # Normalize pixel values

# Build the model
model = tf.keras.Sequential([
    tf.keras.layers.Flatten(input_shape=(28, 28)),  # 28x28 image → 784 flat vector
    tf.keras.layers.Dense(128, activation='relu'),   # Hidden layer with ReLU
    tf.keras.layers.Dropout(0.2),                    # Regularization (20% dropout)
    tf.keras.layers.Dense(10)                        # Output layer (10 digit classes)
])

model.compile(
    optimizer='adam',
    loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy']
)

model.fit(x_train, y_train, epochs=25)

# Evaluate
test_loss, test_acc = model.evaluate(x_test, y_test, verbose=2)
print(f"\nTest accuracy: {test_acc:.4f}")

probability_model = tf.keras.Sequential([
  model,
  tf.keras.layers.Softmax()
])


# Predict first 5 test images
predictions = probability_model(x_test[:5])
print("\nPredictions for first 5 test images:")
for i, pred in enumerate(predictions):
    print(f"  Image {i}: predicted {tf.argmax(pred).numpy()}, actual {y_test[i]}")