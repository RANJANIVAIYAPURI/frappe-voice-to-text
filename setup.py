from setuptools import setup, find_packages

setup(
    name="voice_to_text",
    version="0.0.1",
    description="AI Voice to Text Transcription App",
    author="Custom",
    author_email="admin@example.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=["frappe"],
)
