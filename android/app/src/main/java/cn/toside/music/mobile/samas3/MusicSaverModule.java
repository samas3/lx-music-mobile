package cn.toside.music.mobile.samas3;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.provider.MediaStore;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;

public class MusicSaverModule extends ReactContextBaseJavaModule {
    public MusicSaverModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "MusicSaver";
    }

    @ReactMethod
    public void saveToMusic(String sourcePath, String title, Promise promise) {
        ContentResolver resolver = getReactApplicationContext().getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.Audio.Media.DISPLAY_NAME, title);
        values.put(MediaStore.Audio.Media.MIME_TYPE, "audio/mpeg");
        values.put(MediaStore.Audio.Media.RELATIVE_PATH, "Music/LXMusic/");
        values.put(MediaStore.Audio.Media.IS_PENDING, 1);

        Uri uri = resolver.insert(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, values);
        if (uri == null) {
            promise.reject("INSERT_FAILED", "MediaStore 创建记录失败");
            return;
        }

        try (FileInputStream in = new FileInputStream(new File(sourcePath));
             OutputStream out = resolver.openOutputStream(uri)) {
            if (out == null) {
                throw new RuntimeException("无法打开输出流");
            }
            byte[] buffer = new byte[8192];
            int len;
            while ((len = in.read(buffer)) != -1) {
                out.write(buffer, 0, len);
            }

            values.clear();
            values.put(MediaStore.Audio.Media.IS_PENDING, 0);
            resolver.update(uri, values, null, null);
            promise.resolve(uri.toString());
        } catch (Exception e) {
            resolver.delete(uri, null, null);
            promise.reject("COPY_FAILED", e.getMessage() != null ? e.getMessage() : "未知错误");
        }
    }
}