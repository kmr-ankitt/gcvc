import VideoSection from "../components/VideoSection";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <VideoSection />
    </div>
  );
}
